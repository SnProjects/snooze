import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { WhiteboardsService } from './whiteboards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('whiteboards')
@Controller('whiteboards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WhiteboardsController {
  constructor(private readonly whiteboardsService: WhiteboardsService) {}
}
