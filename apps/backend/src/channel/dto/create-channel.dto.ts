import { IsString, MinLength, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChannelDto {
  @ApiProperty({ description: 'Channel name', example: 'General' })
  @IsString()
  @MinLength(1, { message: 'Channel name must be at least 1 character long' })
  name: string;

  @ApiProperty({ description: 'Server ID', example: 1 })
  @IsInt()
  serverId: string;

  @ApiProperty({ description: 'The type of the channel (TEXT or VOICE)', default: 'TEXT' })
  @IsString()
  @IsOptional()
  type?: string;
}
