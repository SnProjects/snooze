import { Module } from '@nestjs/common';
import { WhiteboardsController } from './whiteboards.controller';
import { WhiteboardsService } from './whiteboards.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhiteboardsGateway } from './whiteboards.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [WhiteboardsController],
  providers: [WhiteboardsService, JwtService, PrismaService, WhiteboardsGateway],

})
export class WhiteboardsModule {}
