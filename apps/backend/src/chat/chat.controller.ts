import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Message } from '@snooze/shared-types';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get messages for a channel' })
  @ApiResponse({
    status: 200,
    description: 'List of messages',
    isArray: true,
    type: Object,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'channelId', required: true, type: Number })
  async getMessages(@Query('channelId') channelId: string): Promise<Message[]> {
    return this.chatService.getMessages(parseInt(channelId, 10));
  }
}
