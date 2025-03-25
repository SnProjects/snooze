import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IMessage } from '@snooze/shared-types';
import { ChatService } from '../chat/chat.service';

export class ChatHandler {
  private logger: Logger = new Logger('ChatHandler');

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly server: Server,
  ) {}

  async handleConnection(socket: Socket) {
    const type = socket.handshake.query.type;
    if (type !== 'chat') {
      socket.disconnect();
      return;
    }

    const token = socket.handshake.auth.token;
    try {
      const payload = this.jwtService.verify(token, {
        secret: 'your-secret-key',
      });
      socket.data.user = payload;
      // Join all channels for the user's servers
      const user = await this.chatService.prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          serverMemberships: { include: { server: { include: { channels: true } } } },
        },
      });

      this.logger.log(`User connected to chat: ${user.username}`);
      user?.serverMemberships.forEach((server) => {
        server.server.channels.forEach((channel) => {
          if (channel.type !== 'TEXT') return;
          socket.join(`${server.server.id}:${channel.id}`);
          this.logger.log(`User joined ${server.server.id}:${channel.id}`);
        });
      });
    } catch {
      socket.disconnect();
      this.logger.error('Invalid token');
    }
  }

  async handleMessage(
    socket: Socket,
    data: { message: string; channelId: string; serverId: string },
  ): Promise<void> {
    const userId = socket.data.user.userId;
    const { message, channelId, serverId } = data;

    // Verify the token (similar to WsJwtGuard)
    const token = socket.handshake.auth.token;
    try {
      this.jwtService.verify(token, { secret: 'your-secret-key' });
    } catch {
      this.logger.error('Invalid token in chatMessage');
      socket.disconnect();
      return;
    }

    const savedMessage = await this.chatService.saveMessage(message, userId, channelId);
    this.server.to(`${serverId}:${channelId}`).emit('chatMessage', savedMessage);
  }
}
