import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomSnapshot } from '@tldraw/sync-core';

@Injectable()
export class WhiteboardsService {
  constructor(public readonly prisma: PrismaService) {}

  async updateChannelData(id: string, data: RoomSnapshot) {
    const channel = await this.prisma.channel.findUnique({
      where: { id },
    });

    if (!channel) {
      throw new ConflictException('Channel not found');
    }

    if (channel.type !== 'WHITEBOARD') {
      throw new ConflictException('Channel is not a whiteboard');
    }

    return this.prisma.channel.update({
      where: { id },
      data: {
        data: data as any, // Prisma stores this as JSON
      },
    });
  }
}
