import { Module } from '@nestjs/common';
import { ServerController } from './server.controller';
import { ServerService } from './server.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ServerController],
  providers: [ServerService, PrismaService],
})
export class ServerModule {}
