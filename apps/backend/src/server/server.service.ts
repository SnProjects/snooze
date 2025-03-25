import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServerService {
  constructor(private prisma: PrismaService) {}

  async create(createServerDto: CreateServerDto, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const server = await this.prisma.server.create({
      data: {
        name: createServerDto.name,
        creatorId: userId,
        creator: user.username,
        members: {
          create: [{ userId }],
        },
      },
      include: { members: true },
    });

    await this.prisma.channel.create({
      data: {
        name: 'general',
        serverId: server.id,
      },
    });

    return server;
  }

  async findAll(userId: string) {
    const servers = await this.prisma.server.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
    });
    return servers;
  }

  async findUsers(serverId: string, userId: string) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    if (!server || !server.members.some((member) => member.userId === userId)) {
      throw new ForbiddenException('You are not a member of this server');
    }

    return server.members.map((member) => ({
      id: member.user.id,
      username: member.user.username,
      role: member.role || 'Member',
    }));
  }

  async join(serverId: string, userId: string) {
    const server = await this.prisma.server.findUnique({
      where: { id: serverId },
      include: { members: true },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    if (server.members.some((member) => member.userId === userId)) {
      throw new ForbiddenException('You are already a member of this server');
    }

    await this.prisma.serverMember.create({
      data: {
        userId,
        serverId,
      },
    });

    return this.prisma.server.findUnique({
      where: { id: serverId },
      include: { members: true },
    });
  }
}
