import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message } from '@snooze/shared-types';

@Injectable()
export class ChatService {
  constructor(public prisma: PrismaService) {}

  async saveMessage(
    content: string,
    userId: number,
    channelId: number,
  ): Promise<Message> {
    // Fetch the channel to validate it exists and belongs to the server
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { server: true },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    // Fetch the user to get the username
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create the message
    const message = await this.prisma.message.create({
      data: {
        content,
        userId,
        channelId,
        serverId: channel.serverId,
        username: user.username,
      },
      include: { user: true },
    });

    return {
      id: message.id,
      content: message.content,
      username: message.username,
      userId: message.userId,
      channelId: message.channelId,
      serverId: message.serverId,
      createdAt: message.createdAt.toISOString(),
    };
  }

  async getMessages(channelId: number): Promise<Message[]> {
    // Validate that the channel belongs to the server
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: { server: true },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        channelId,
      },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      userId: msg.userId,
      channelId: msg.channelId,
      serverId: msg.serverId,
      username: msg.username,
      createdAt: msg.createdAt.toISOString(),
    }));
  }
}
