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
import { IMessage } from '@snooze/shared-types';

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
  @ApiQuery({ name: 'channelId', required: true, type: String })
  async getMessages(@Query('channelId') channelId: string): Promise<IMessage[]> {
    return this.chatService.getMessages(channelId);
  }
}
