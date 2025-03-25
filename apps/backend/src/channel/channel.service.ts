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
      include: { peers: true },
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

  async findWhiteboardChannels(serverId: string, userId: any) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
      include: { members: true },
    });

    if (!server || !server.members.some((member) => member.userId === userId)) {
      throw new ForbiddenException('You are not a member of this server');
    }

    return this.prisma.channel.findMany({
      where: { serverId, type: 'WHITEBOARD' },
    });
  }

  async updateChannelData(id: string, data: any) {
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
        data: data,
      },
    });
  }
}
