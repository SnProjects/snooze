import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('channels')
@Controller('channels')
export class ChannelController {
  constructor(private readonly channelsService: ChannelService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new channel in a server' })
  @ApiResponse({ status: 201, description: 'Channel created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post()
  create(@Body() createChannelDto: CreateChannelDto, @Request() req) {
    return this.channelsService.createChannel(
      createChannelDto,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all channels in a server' })
  @ApiResponse({ status: 200, description: 'List of channels.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get(':serverId')
  findAll(@Param('serverId') serverId: string, @Request() req) {
    return this.channelsService.findAll(serverId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all text channels in a server' })
  @ApiResponse({ status: 200, description: 'List of text channels.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get(':serverId/text')
  findTextChannels(@Param('serverId') serverId: string, @Request() req) {
    return this.channelsService.findTextChannels(serverId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all voice channels in a server' })
  @ApiResponse({ status: 200, description: 'List of voice channels.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get(':serverId/voice')
  findVoiceChannels(@Param('serverId') serverId: string, @Request() req) {
    return this.channelsService.findVoiceChannels(serverId, req.user.userId);
  }
}
