import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IMessage } from '@snooze/shared-types';
import { ServerMember } from '@prisma/client';

@Injectable()
export class VoiceService {
  async OnUserDisconnected(userId: any) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        serverMemberships: {
          include: {
            activeVc: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // remove the user from all voice channels
    for (const membership of user.serverMemberships) {
      if (membership.activeVc) {
        // remove the user from the voice channel
        const updatedVC = await this.prisma.channel.update({
          where: { id: membership.activeVc.id },
          data: {
            peers: {
              disconnect: {
                id: membership.id,
              },
            },
          },
          include: {
            peers: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        });

        return updatedVC;
      }
    }

    return null;
  }

  constructor(public prisma: PrismaService) {}

  async OnUserJoinedVoiceChannel(
    serverId: string,
    channelId: string,
    userId: string,
  ) {
    // update the database to reflect that the user is in the voice channel
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const member = await this.prisma.serverMember.findFirst({
      where: {
        userId: userId,
        serverId: serverId,
      },
    });

    if (!member) {
      throw new NotFoundException('User not found');
    }

    if (channel.type !== 'VOICE') {
      throw new ForbiddenException('Channel is not a voice channel');
    }

    // add the user to the voice channel
    const updatedVC = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        peers: {
          connect: {
            id: member.id,
          },
        },
      },
      include: {
        peers: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    return updatedVC;
  }

  async OnUserLeftVoiceChannel(
    serverId: string,
    channelId: string,
    userId: string,
  ) {
    // update the database to reflect that the user is no longer in the voice channel
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const member = await this.prisma.serverMember.findFirst({
      where: {
        userId: userId,
        serverId: serverId,
      },
    });

    if (!member) {
      throw new NotFoundException('User not found');
    }

    if (channel.type !== 'VOICE') {
      throw new ForbiddenException('Channel is not a voice channel');
    }

    // remove the user from the voice channel
    const updatedVC = await this.prisma.channel.update({
      where: { id: channelId },
      data: {
        peers: {
          disconnect: {
            id: member.id,
          },
        },
      },
      include: {
        peers: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    return updatedVC;
  }

  async GetUsersInVoiceChannel(
    serverId: string,
    channelId: string,
  ): Promise<ServerMember[]> {
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
      include: {
        peers: true,
      },
    });

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (channel.type !== 'VOICE') {
      throw new ForbiddenException('Channel is not a voice channel');
    }

    return channel.peers;
  }
}
