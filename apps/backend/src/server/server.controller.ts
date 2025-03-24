import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ServerService } from './server.service';
import { CreateServerDto } from './dto/create-server.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('servers')
@Controller('servers')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new server' })
  @ApiResponse({ status: 201, description: 'Server created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post()
  create(@Body() createServerDto: CreateServerDto, @Request() req) {
    return this.serverService.create(createServerDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all servers for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of servers.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get()
  findAll(@Request() req) {
    return this.serverService.findAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users in a server' })
  @ApiResponse({ status: 200, description: 'List of users in the server.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get(':id/users')
  findUsers(@Param('id') id: string, @Request() req) {
    return this.serverService.findUsers(+id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a server by ID' })
  @ApiResponse({ status: 200, description: 'Successfully joined the server.' })
  @ApiResponse({ status: 404, description: 'Server not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post(':id/join')
  join(@Param('id') id: string, @Request() req) {
    return this.serverService.join(+id, req.user.userId);
  }
}
