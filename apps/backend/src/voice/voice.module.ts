import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { VoiceGateway } from './voice.gateway';
import { VoiceService } from './voice.service';

@Module({
  controllers: [],
  providers: [PrismaService, JwtService, VoiceService, VoiceGateway],
  exports: [VoiceService],
})
export class VoiceModule {}
