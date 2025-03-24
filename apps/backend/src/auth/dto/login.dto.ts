import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ description: 'Username or email', example: 'johndoe or john@example.com' })
    @IsString()
    identifier!: string;

    @ApiProperty({ description: 'Password', example: 'P@ssw0rd' })
    @IsString()
    password!: string;
}