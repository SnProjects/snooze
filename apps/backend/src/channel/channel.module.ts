import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ChannelController],
  providers: [PrismaService, ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
