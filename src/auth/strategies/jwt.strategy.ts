import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extract JWT from Authorization header as Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Use Supabase JWT Secret from .env
      secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET') || 'default_secret_change_me',
    });
  }

  /**
   * Passport validates the JWT signature and decodes it.
   * This method returns the payload to be appended to Request.user.
   */
  async validate(payload: any) {
    // Supabase JWT payload usually contains 'sub' (uuid), 'email', etc.
    return { 
      id: payload.sub, 
      email: payload.email,
      name: payload.user_metadata?.full_name || payload.name, 
    };
  }
}
