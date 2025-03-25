import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { RoomSnapshot, TLSocketRoom, WebSocketMinimal } from '@tldraw/sync-core';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { parse } from 'url';
import { WebSocketProtocol } from '../custom-ws-adapter';
import { WhiteboardsService } from './whiteboards.service';

@WebSocketGateway(3040, {
  cors: true,
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
    this.logger.log('WhiteboardsGateway initialized on port 3040 with path /whiteboard');
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
            if (args.numSessionsRemaining === 0) {
              room.close();
            }
          },
          onDataChange() {
            roomState!.needsPersist = true;
          },
        }),
        needsPersist: false,
      };
      this.rooms.set(channelId as string, roomState);
    }

    roomState.room.handleSocketConnect({ sessionId: sessionId as string,  socket: client });
    this.logger.log(`Socket connected to room for channel ${channelId}`);
  }

  handleDisconnect(client: WebSocket) {
    this.logger.log(`Client disconnected: ${client}`);
  }
}
