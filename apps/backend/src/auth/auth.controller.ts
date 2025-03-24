import { Controller, Post, Body, HttpCode, UsePipes, ValidationPipe, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthResponse } from '@snooze/shared-types';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    //@ts-ignore
    @ApiResponse({ status: 201, description: 'User registered', type: AuthResponse })
    @ApiResponse({ status: 409, description: 'Username or email already taken' })
    @UsePipes(new ValidationPipe({ transform: true }))
    async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(200)
    @ApiOperation({ summary: 'Login a user' })
    //@ts-ignore
    @ApiResponse({ status: 200, description: 'User logged in', type: AuthResponse })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @UsePipes(new ValidationPipe({ transform: true }))
    async login(@Body() dto: LoginDto): Promise<AuthResponse> {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @HttpCode(200)
    @ApiOperation({ summary: 'Refresh access token' })
    //@ts-ignore
    @ApiResponse({ status: 200, description: 'Tokens refreshed', type: AuthResponse })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refresh(@Body('refresh_token') refreshToken: string): Promise<AuthResponse> {
        return this.authService.refresh(refreshToken);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout a user' })
    @ApiResponse({ status: 200, description: 'User logged out' })
    async logout(@Request() req) {
        await this.authService.logout(req.user.userId);
        return { message: 'Logged out successfully' };
    }
}
