import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  controllers: [ChannelController],
  imports: [HttpModule],
  providers: [PrismaService, ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
