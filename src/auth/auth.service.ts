import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async googleLogin(req: any) {
    if (!req.user) {
      throw new InternalServerErrorException('No user found in request');
    }

    const { googleId, email, firstName, lastName, picture } = req.user;
    const name = `${firstName} ${lastName}`.trim();

    const user = await this.usersService.findOrCreate(
      email, 
      name, 
      picture,
      googleId
    );

    const payload = { 
      sub: user.id, 
      email: user.email, 
      name: user.name 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}

