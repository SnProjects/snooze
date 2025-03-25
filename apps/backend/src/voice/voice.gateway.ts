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
          serverMemberships: {
            include: { server: { include: { channels: true } } },
          },
        },
      });

      this.logger.log(`User connected: ${user.username}`);
      user?.serverMemberships.forEach((server) => {
        // updates-{serverId} is a room for server updates
        client.join(`updates-${server.serverId}`);
        this.logger.log(`User joined updates-${server.server.id}`);
      });
    } catch {
      client.disconnect();
      this.logger.error('Invalid token');
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove user from all voice channels
    const newChannel = await this.voiceService.OnUserDisconnected(
      client.data.user.userId,
    );
  }

  @SubscribeMessage('join-voice-channel')
  async handleJoinVoiceChannel(
    client: Socket,
    payload: { serverId: string; channelId: string; userId: string },
  ) {
    const { serverId, channelId, userId } = payload;
    const room = `voice-${serverId}-${channelId}`;
    client.join(room);
    this.logger.log(`User ${userId} joined voice channel ${room}`);

    // Notify other users in the channel
    client.to(room).emit('user-joined', { userId });

    const updatedChannel = await this.voiceService.OnUserJoinedVoiceChannel(
      serverId,
      channelId,
      userId,
    );

    // make sure the user is in the updates room
    const updates_room = `updates-${serverId}`;

    client.join(updates_room);
    //todo: emit to everyone in the updates room
    this.server.to(updates_room).emit(updates_room, {
      status: 'vc-user-joined',
      channelId: channelId,
      peers: updatedChannel.peers,
    });
  }

  @SubscribeMessage('leave-voice-channel')
  async handleLeaveVoiceChannel(
    client: Socket,
    payload: { serverId: string; channelId: string; userId: string },
  ) {
    const { serverId, channelId, userId } = payload;
    const room = `voice-${serverId}-${channelId}`;
    client.leave(room);
    this.logger.log(`User ${userId} left voice channel ${room}`);

    // Notify other users in the channel
    client.to(room).emit('user-left', { userId });

    const updatedChannel = await this.voiceService.OnUserLeftVoiceChannel(
      serverId,
      channelId,
      userId,
    );

    // make sure the user is in the updates room
    const updates_room = `updates-${serverId}`;

    client.join(updates_room);
    //todo: emit to everyone in the updates room
    this.server.to(updates_room).emit(updates_room, {
      status: 'vc-user-left',
      channelId: channelId,
      peers: updatedChannel.peers,
    });
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
      serverId: string;
      channelId: string;
      answer: any;
      fromUserId: string;
      toUserId: string;
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
      serverId: string;
      channelId: string;
      candidate: any;
      fromUserId: string;
      toUserId: string;
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
