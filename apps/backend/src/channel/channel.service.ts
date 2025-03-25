import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService) {}

  async createChannel(dto: CreateChannelDto, userId: string) {
    const serverId = dto.serverId;
    const existingChannel = await this.prisma.channel.findFirst({
      where: {
        name: dto.name,
        serverId,
      },
    });
    if (existingChannel) {
      throw new ConflictException('Channel name already exists in this server');
    }

    return this.prisma.channel.create({
      data: {
        name: dto.name,
        type: dto.type || 'TEXT',
        server: {
          connect: { id: serverId },
        },
      },
    });
  }

  async findAll(serverId: string, userId: string) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
      include: { members: true },
    });

    if (!server || !server.members.some((member) => member.userId === userId)) {
      throw new ForbiddenException('You are not a member of this server');
    }

    return this.prisma.channel.findMany({
      where: { serverId },
    });
  }

  async findTextChannels(serverId: string, userId: string) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
      include: { members: true },
    });

    if (!server || !server.members.some((member) => member.userId === userId)) {
      throw new ForbiddenException('You are not a member of this server');
    }

    return this.prisma.channel.findMany({
      where: { serverId, type: 'TEXT' },
    });
  }

  async findVoiceChannels(serverId: string, userId: string) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
      include: { members: true },
    });

    if (!server || !server.members.some((member) => member.userId === userId)) {
      throw new ForbiddenException('You are not a member of this server');
    }

    return this.prisma.channel.findMany({
      where: { serverId, type: 'VOICE' },
      include: { peers: true },
    });
  }
}
