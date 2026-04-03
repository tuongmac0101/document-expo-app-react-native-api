import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsGuard implements CanActivate {
  private readonly logger = new Logger(WsGuard.name);

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    
    // Auth token can be in 'auth' object (standard for socket.io-client)
    // or in headers (if using custom transport)
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      this.logger.error('No token found in handshake');
      throw new WsException('Unauthorized access');
    }

    try {
      const secret = this.configService.get<string>('SOCKET_JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: secret || 'default_secret_change_me',
      });
      
      // Attach user info to socket client data
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.user_metadata?.full_name || payload.name,
      };
      
      this.logger.log(`User ${client.data.user.email} connected via WebSocket`);
      return true;
    } catch (err) {
      this.logger.error(`Token verification failed: ${err.message}`);
      throw new WsException('Invalid token');
    }
  }
}
