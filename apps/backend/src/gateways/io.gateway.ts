import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VoiceService } from '../voice/voice.service';
import { ChatService } from '../chat/chat.service';
import { VoiceHandler } from './voice.handler';
import { ChatHandler } from './chat.handler';
import { WebSocketProtocol } from '../custom-ws-adapter';

@WebSocketGateway({
  cors: {
    origin: '*', // Update to your frontend domain in production
    methods: ['GET', 'POST'],
    credentials: true,
  },
  WEBSOCKET_PROTOCOL: WebSocketProtocol.SOCKET_IO,
})
export class SocketIOGateway {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SocketIOGateway');
  private voiceHandler: VoiceHandler;
  private chatHandler: ChatHandler;

  constructor(
    private readonly voiceService: VoiceService,
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {
    // Initialize handlers with the server instance
    this.voiceHandler = new VoiceHandler(voiceService, jwtService, this.server);
    this.chatHandler = new ChatHandler(chatService, jwtService, this.server);
  }

  afterInit() {
    this.logger.log('SocketIOGateway initialized');
    // Set up namespaces
    this.server.of('/voice').on('connection', (socket: Socket) => this.handleVoiceConnection(socket));
    this.server.of('/chat').on('connection', (socket: Socket) => this.handleChatConnection(socket));
  }

  private async handleVoiceConnection(socket: Socket) {
    await this.voiceHandler.handleConnection(socket);

    socket.on('disconnect', () => {
      this.voiceHandler.handleDisconnect(socket);
    });

    socket.on('join-voice-channel', (payload: { serverId: string; channelId: string; userId: string }) => {
      this.voiceHandler.handleJoinVoiceChannel(socket, payload);
    });

    socket.on('leave-voice-channel', (payload: { serverId: string; channelId: string; userId: string }) => {
      this.voiceHandler.handleLeaveVoiceChannel(socket, payload);
    });

    socket.on('offer', (payload: { serverId: number; channelId: number; offer: any; fromUserId: number; toUserId: number }) => {
      this.voiceHandler.handleOffer(socket, payload);
    });

    socket.on('answer', (payload: { serverId: string; channelId: string; answer: any; fromUserId: string; toUserId: string }) => {
      this.voiceHandler.handleAnswer(socket, payload);
    });

    socket.on('ice-candidate', (payload: { serverId: string; channelId: string; candidate: any; fromUserId: string; toUserId: string }) => {
      this.voiceHandler.handleIceCandidate(socket, payload);
    });
  }

  private async handleChatConnection(socket: Socket) {
    await this.chatHandler.handleConnection(socket);

    socket.on('chatMessage', (data: { message: string; channelId: string; serverId: string }) => {
      this.chatHandler.handleMessage(socket, data);
    });
  }
}
