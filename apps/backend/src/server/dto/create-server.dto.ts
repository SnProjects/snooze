import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServerDto {
  @ApiProperty({ description: 'Server name', example: 'My Server' })
  @IsString()
  @MinLength(1, { message: 'Server name must be at least 1 character long' })
  name: string;
}
