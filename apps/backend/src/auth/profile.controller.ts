import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from '@snooze/shared-types';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('auth')
@Controller('auth')
export class ProfileController {
  constructor(private prisma: PrismaService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile', type: Object })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
