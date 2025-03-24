import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VoiceService } from './voice.service';

@WebSocketGateway(3030, { cors: true })
export class VoiceGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('VoiceGateway');

  constructor(
    private voiceService: VoiceService,
    private jwtService: JwtService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    try {
      const payload = this.jwtService.verify(token, {
        secret: 'your-secret-key',
      });
      client.data.user = payload;
      // Join all channels for the user's servers
      const user = await this.voiceService.prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          servers: { include: { server: { include: { channels: true } } } },
        },
      });

      this.logger.log(`User connected: ${user.username}`);
      user?.servers.forEach((server) => {
        server.server.channels.forEach((channel) => {
          if (channel.type !== 'VOICE') return;
          client.join(`channel-${server.server.id}:${channel.id}`);
          this.logger.log(`User joined ${server.server.id}:${channel.id}`);
        });
      });
    } catch {
      client.disconnect();
      this.logger.error('Invalid token');
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-voice-channel')
  handleJoinVoiceChannel(
    client: Socket,
    payload: { serverId: number; channelId: number; userId: number },
  ) {
    const { serverId, channelId, userId } = payload;
    const room = `voice-${serverId}-${channelId}`;
    const updates_room = `updates-${serverId}-${channelId}`;
    client.join(room);
    this.logger.log(`User ${userId} joined voice channel ${room}`);

    // Notify other users in the channel
    client.to(room).emit('user-joined', { userId });
    client.to(updates_room).emit('user-joined', { userId });
  }

  @SubscribeMessage('leave-voice-channel')
  handleLeaveVoiceChannel(
    client: Socket,
    payload: { serverId: number; channelId: number; userId: number },
  ) {
    const { serverId, channelId, userId } = payload;
    const room = `voice-${serverId}-${channelId}`;
    const updates_room = `updates-${serverId}-${channelId}`;
    client.leave(room);
    this.logger.log(`User ${userId} left voice channel ${room}`);

    // Notify other users in the channel
    client.to(room).emit('user-left', { userId });
    client.to(updates_room).emit('user-left', { userId });
  }

  @SubscribeMessage('offer')
  handleOffer(
    client: Socket,
    payload: {
      serverId: number;
      channelId: number;
      offer: any;
      fromUserId: number;
      toUserId: number;
    },
  ) {
    const { serverId, channelId, offer, fromUserId, toUserId } = payload;
    const room = `voice-${serverId}-${channelId}`;
    this.logger.log(`Offer from ${fromUserId} to ${toUserId} in ${room}`);
    this.server.to(room).emit('offer', { offer, fromUserId, toUserId });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    client: Socket,
    payload: {
      serverId: number;
      channelId: number;
      answer: any;
      fromUserId: number;
      toUserId: number;
    },
  ) {
    const { serverId, channelId, answer, fromUserId, toUserId } = payload;
    const room = `voice-${serverId}-${channelId}`;
    this.logger.log(`Answer from ${fromUserId} to ${toUserId} in ${room}`);
    this.server.to(room).emit('answer', { answer, fromUserId, toUserId });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    client: Socket,
    payload: {
      serverId: number;
      channelId: number;
      candidate: any;
      fromUserId: number;
      toUserId: number;
    },
  ) {
    const { serverId, channelId, candidate, fromUserId, toUserId } = payload;
    const room = `voice-${serverId}-${channelId}`;
    this.logger.log(
      `ICE candidate from ${fromUserId} to ${toUserId} in ${room}`,
    );
    this.server
      .to(room)
      .emit('ice-candidate', { candidate, fromUserId, toUserId });
  }
}
