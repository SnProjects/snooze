import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from './ws-jwt.guard';
import { IMessage } from '@snooze/shared-types';
import { WebSocketProtocol } from '../custom-ws-adapter';

@WebSocketGateway({ cors: true, WEBSOCKET_PROTOCOL: WebSocketProtocol.SOCKET_IO })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  constructor(
    private readonly chatService: ChatService,
    private jwtService: JwtService,
  ) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(socket: Socket) {
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

      this.logger.log(`User connected: ${user.username}`);
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

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('chatMessage')
  async handleMessage(
    @MessageBody()
    data: { message: string; channelId: string; serverId: string },
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const userId = socket.data.user.userId;
    const { message, channelId, serverId } = data;
    const savedMessage = await this.chatService.saveMessage(message, userId, channelId);

    this.server.to(`${serverId}:${channelId}`).emit('chatMessage', savedMessage);
  }
}
