import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../chat/chat.service';
import { VoiceService } from '../voice/voice.service';
import { SocketIOGateway } from './io.gateway';

@Module({
  providers: [PrismaService, JwtService, VoiceService, ChatService, SocketIOGateway],
})
export class SocketIOModule {}
