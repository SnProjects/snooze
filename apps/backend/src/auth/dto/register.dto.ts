import { IsString, MinLength, Matches, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ description: 'Unique username', example: 'johndoe' })
    @IsString()
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    @IsNotEmpty()
    username!: string;

    @ApiProperty({ description: 'User email', example: 'john@example.com' })
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ description: 'Password (min 8 chars, with uppercase, lowercase, number, and special char)', example: 'P@ssw0rd' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    @IsNotEmpty()
    password!: string;
}