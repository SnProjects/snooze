import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const client = context.switchToWs().getClient();
        const token = client.handshake.auth.token;
        try {
            const payload = this.jwtService.verify(token, { secret: 'your-secret-key' });
            client.data.user = payload;
            return true;
        } catch {
            return false;
        }
    }
}