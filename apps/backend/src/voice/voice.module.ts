import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { VoiceService } from './voice.service';
import { VoiceGateway } from './voice.gateway';

@Module({
  controllers: [],
  providers: [PrismaService, JwtService, VoiceService, VoiceGateway],
})
export class VoiceModule {}
