import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { RoomSnapshot, TLSocketRoom } from '@tldraw/sync-core';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { parse } from 'url';
import { WebSocketProtocol } from '../custom-ws-adapter';
import { WhiteboardsService } from './whiteboards.service';

// Define a custom CloseEvent class for Node.js
class CustomCloseEvent {
  readonly type: string = 'close';
  readonly code: number;
  readonly reason: string;
  readonly wasClean: boolean;

  constructor(type: string, init?: { code?: number; reason?: string; wasClean?: boolean }) {
    this.type = type;
    this.code = init?.code ?? 1000;
    this.reason = init?.reason ?? '';
    this.wasClean = init?.wasClean ?? true;
  }
}

interface RoomState {
  room: TLSocketRoom<any, void>;
  id: string;
  needsPersist: boolean;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Update to your frontend domain in production
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/whiteboard',
  WEBSOCKET_PROTOCOL: WebSocketProtocol.WS,
})
export class WhiteboardsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('WhiteboardsGateway');
  private rooms: Map<string, { room: TLSocketRoom<any, void>; needsPersist: boolean }> = new Map();

  constructor(
    private readonly whiteboardService: WhiteboardsService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.log('WhiteboardsGateway initialized');

    // Periodically persist rooms and clean up closed rooms
    setInterval(() => {
      for (const [channelId, roomState] of this.rooms.entries()) {
        if (roomState.needsPersist) {
          roomState.needsPersist = false;
          this.logger.log(`Saving snapshot for whiteboard channel ${channelId}`);
          this.whiteboardService
            .updateChannelData(channelId, roomState.room.getCurrentSnapshot())
            .catch((err) => this.logger.error(`Failed to save snapshot for channel ${channelId}: ${err}`));
        }
        if (roomState.room.isClosed()) {
          this.logger.log(`Deleting closed room for whiteboard channel ${channelId}`);
          this.rooms.delete(channelId);
        }
      }
    }, 2000);
  }

  afterInit(server: Server) {
    this.logger.log('WhiteboardsGateway initialized with path /whiteboard');
  }

  async handleConnection(client: WebSocket, request: any) {
    this.logger.log(`Client attempting to connect: ${client}`);

    // Parse query parameters from the URL
    const url = parse(request.url || '', true);
    const { channelId, sessionId, token } = url.query;

    this.logger.log(`Query parameters: channelId=${channelId}, sessionId=${sessionId}, token=${token}`);

    if (!channelId || !sessionId || !token) {
      this.logger.error('Missing channelId, sessionId, or token');
      client.close(1008, 'Missing required query parameters');
      return;
    }

    // Verify the token
    try {
      const payload = this.jwtService.verify(token as string, {
        secret: 'your-secret-key',
      });
      (client as any).user = payload;
      (client as any).sessionId = sessionId; // Store sessionId for later use
      this.logger.log(`User connected: ${payload.userId}`);
    } catch (err) {
      this.logger.error(`Invalid token: ${err.message}`);
      client.close(1008, 'Invalid token');
      return;
    }

    // Verify that the channel exists and is a whiteboard channel
    const channel = await this.whiteboardService.prisma.channel.findUnique({
      where: { id: channelId as string },
    });

    if (!channel || channel.type !== 'WHITEBOARD') {
      this.logger.error(`Channel ${channelId} is not a whiteboard channel`);
      client.close(1008, 'Invalid channel');
      return;
    }

    // Load or create the room
    let roomState = this.rooms.get(channelId as string);
    if (!roomState || roomState.room.isClosed()) {
      this.logger.log(`Loading whiteboard channel ${channelId}`);
      const initialSnapshot = Object.keys(channel.data).length > 0 ? (channel.data as unknown as RoomSnapshot) : undefined;

      roomState = {
        room: new TLSocketRoom({
          initialSnapshot,
          onSessionRemoved(room, args) {
            Logger.log(`Session removed for channel ${channelId}, sessionId: ${args.sessionId}, numSessionsRemaining: ${args.numSessionsRemaining}`);
            if (args.numSessionsRemaining === 0) {
              Logger.log(`Closing room for channel ${channelId} due to no remaining sessions`);
              room.close();
            }
          },
          onDataChange() {
            Logger.log(`Data changed for channel ${channelId}`);
            roomState!.needsPersist = true;
          },
          onAfterReceiveMessage(message) {
            Logger.log(`Message received for channel ${channelId}: ${JSON.stringify(message)}`);
          },
        }),
        needsPersist: false,
      };

      this.rooms.set(channelId as string, roomState);
    } else {
      this.logger.log(`Reusing whiteboard channel ${channelId}`);
    }

    // Create a socket wrapper that matches the WebSocketMinimal interface expected by TLSocketRoom
    const socketWrapper = {
      readyState: client.readyState,
      send: (data: string | ArrayBuffer | Blob | ArrayBufferView) => {
        if (client.readyState === WebSocket.OPEN) {
          this.logger.log(`Sending message to client: ${data}`);
          client.send(data);
        } else {
          this.logger.warn('Cannot send message: WebSocket is not open');
        }
      },
      close: (code?: number, reason?: string) => {
        this.logger.log(`Closing WebSocket with code ${code}, reason: ${reason}`);
        client.close(code, reason);
      },
      onmessage: null as ((ev: MessageEvent) => void) | null,
      onclose: null as ((ev: CustomCloseEvent) => void) | null,
      onerror: null as ((ev: Event) => void) | null,
      addEventListener: (
        event: string,
        listener: (...args: any[]) => void,
        options?: any,
      ) => {
        if (event === 'message') {
          socketWrapper.onmessage = (ev: MessageEvent) => listener(ev);
          client.on('message', (data: Buffer) => {
            this.logger.log(`Received message from client: ${data.toString()}`);
            const messageEvent = new MessageEvent('message', { data: data.toString() });
            if (socketWrapper.onmessage) {
              socketWrapper.onmessage(messageEvent);
            }
          });
        } else if (event === 'close') {
          socketWrapper.onclose = (ev: CustomCloseEvent) => listener(ev);
          client.on('close', (code: number, reason: Buffer) => {
            this.logger.log(`Client closed connection: code=${code}, reason=${reason.toString()}`);
            const closeEvent = new CustomCloseEvent('close', { code, reason: reason.toString() });
            if (socketWrapper.onclose) {
              socketWrapper.onclose(closeEvent);
            }
          });
        } else if (event === 'error') {
          socketWrapper.onerror = (ev: Event) => listener(ev);
          client.on('error', (err: Error) => {
            this.logger.error(`WebSocket error: ${err.message}`);
            const errorEvent = new Event('error');
            (errorEvent as any).error = err;
            if (socketWrapper.onerror) {
              socketWrapper.onerror(errorEvent);
            }
          });
        }
      },
      removeEventListener: (event: string, listener: (...args: any[]) => void) => {
        if (event === 'message' && socketWrapper.onmessage === listener) {
          socketWrapper.onmessage = null;
          client.removeAllListeners('message');
        } else if (event === 'close' && socketWrapper.onclose === listener) {
          socketWrapper.onclose = null;
          client.removeAllListeners('close');
        } else if (event === 'error' && socketWrapper.onerror === listener) {
          socketWrapper.onerror = null;
          client.removeAllListeners('error');
        }
      },
    };

    this.logger.log(`Connecting socket to room for channel ${channelId}`);
    this.logger.log(`Session ID: ${sessionId}`);
    this.logger.log(`User ID: ${(client as any).user.userId}`);
    this.logger.log(`User Name: ${(client as any).user.username}`);
    roomState.room.handleSocketConnect({ sessionId: sessionId as string, socket: socketWrapper });
    this.logger.log(`Socket connected to room for channel ${channelId}`);
  }

  handleDisconnect(client: WebSocket) {
    this.logger.log(`Client disconnected: ${client}, sessionId: ${(client as any).sessionId}`);
    // Let TLSocketRoom handle session removal via its onSessionRemoved callback
  }
}
