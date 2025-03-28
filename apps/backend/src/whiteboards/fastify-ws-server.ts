import fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import cors from '@fastify/cors';
import { RoomSnapshot, TLSocketRoom } from '@tldraw/sync-core';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WhiteboardsService } from './whiteboards.service';

// For this example, we'll keep the same in-memory map of rooms as in the WhiteboardsGateway
interface RoomState {
  room: TLSocketRoom<any, void>;
  id: string;
  needsPersist: boolean;
}

export class FastifyWsServer {
  private app = fastify();
  private logger: Logger = new Logger('FastifyWsServer');
  private rooms: Map<string, { room: TLSocketRoom<any, void>; needsPersist: boolean }> = new Map();
  private jwtService: JwtService;
  private whiteboardService: WhiteboardsService;

  constructor(jwtService: JwtService, whiteboardService: WhiteboardsService) {
    this.jwtService = jwtService;
    this.whiteboardService = whiteboardService;

    // Register plugins
    this.app.register(websocketPlugin);
    this.app.register(cors, { origin: '*' });

    // Set up routes
    this.setupRoutes();

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

  private async setupRoutes() {
    this.app.get('/whiteboard/connect/:channelId', { websocket: true }, async (socket, req) => {
      const channelId = (req.params as any).channelId as string;
      const sessionId = (req.query as any)?.['sessionId'] as string;
      const token = (req.query as any)?.['token'] as string;

      this.logger.log(`Client attempting to connect: channelId=${channelId}, sessionId=${sessionId}, token=${token}`);

      if (!channelId || !sessionId || !token) {
        this.logger.error('Missing channelId, sessionId, or token');
        socket.close(1008, 'Missing required query parameters');
        return;
      }

      // Verify the token
      let user: any;
      try {
        const payload = this.jwtService.verify(token, {
          secret: 'your-secret-key',
        });
        user = payload;
        this.logger.log(`User connected: ${payload.userId}`);
      } catch (err) {
        this.logger.error(`Invalid token: ${err.message}`);
        socket.close(1008, 'Invalid token');
        return;
      }

      // Verify that the channel exists and is a whiteboard channel
      const channel = await this.whiteboardService.prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel || channel.type !== 'WHITEBOARD') {
        this.logger.error(`Channel ${channelId} is not a whiteboard channel`);
        socket.close(1008, 'Invalid channel');
        return;
      }

      // Load or create the room
      let roomState = this.rooms.get(channelId);
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

        this.rooms.set(channelId, roomState);
      } else {
        this.logger.log(`Reusing whiteboard channel ${channelId}`);
      }

      this.logger.log(`Connecting socket to room for channel ${channelId}`);
      this.logger.log(`Session ID: ${sessionId}`);
      this.logger.log(`User ID: ${user.userId}`);
      this.logger.log(`User Name: ${user.username}`);
      roomState.room.handleSocketConnect({ sessionId, socket });
      this.logger.log(`Socket connected to room for channel ${channelId}`);
    });
  }

  public async start(port: number): Promise<void> {
    await this.app.listen({ port });
    this.logger.log(`Fastify WebSocket server started on port ${port}`);
  }

  public async close(): Promise<void> {
    await this.app.close();
    this.logger.log('Fastify WebSocket server closed');
  }

  public getServer() {
    return this.app.server;
  }
}
