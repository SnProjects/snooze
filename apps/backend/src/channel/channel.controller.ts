import { Controller, Get, Post, Body, Param, UseGuards, Request, Put, Req, Res } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request as ExpressRequest, Response } from 'express';
import * as unfurl from 'unfurl.js';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@ApiTags('channels')
@Controller('channels')
export class ChannelController {
  constructor(
    private readonly channelsService: ChannelService,
    private readonly httpService: HttpService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new channel in a server' })
  @ApiResponse({ status: 201, description: 'Channel created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post()
  create(@Body() createChannelDto: CreateChannelDto, @Request() req) {
    return this.channelsService.createChannel(createChannelDto, req.user.userId);
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all whiteboard channels in a server' })
  @ApiResponse({ status: 200, description: 'List of whiteboard channels.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get(':serverId/whiteboard')
  findWhiteboardChannels(@Param('serverId') serverId: string, @Request() req) {
    return this.channelsService.findWhiteboardChannels(serverId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload an asset (e.g., image) for a whiteboard' })
  @ApiResponse({ status: 200, description: 'Asset uploaded' })
  @Put('uploads/:id')
  async uploadAsset(@Param('id') id: string, @Req() req: ExpressRequest, @Res() res: Response) {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      try {
        await firstValueFrom(
          this.httpService.put(`http://localhost:3001/files/${id}`, buffer, {
            headers: {
              'Content-Type': 'application/octet-stream',
            },
          }),
        );
        res.status(200).json({ ok: true });
      } catch (err) {
        res.status(500).json({ error: 'Failed to upload asset to CDN', details: err.message });
      }
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve an asset (e.g., image) for a whiteboard' })
  @ApiResponse({ status: 200, description: 'Asset retrieved' })
  @Get('uploads/:id')
  async getAsset(@Param('id') id: string, @Res() res: Response) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://localhost:3001/files/${id}`, {
          responseType: 'arraybuffer',
        }),
      );
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(Buffer.from(response.data));
    } catch (err) {
      res.status(404).send('Asset not found');
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfurl a URL for bookmark assets' })
  @ApiResponse({ status: 200, description: 'Unfurled URL data' })
  @Get('unfurl')
  async unfurlUrl(@Body('url') url: string) {
    const { title, description, open_graph, twitter_card, favicon } = await unfurl.unfurl(url);
    const image = open_graph?.images?.[0]?.url || twitter_card?.images?.[0]?.url;
    return {
      title,
      description,
      image,
      favicon,
    };
  }
}
