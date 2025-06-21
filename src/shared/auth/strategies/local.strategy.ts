import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // This is for identifying who's trying to log in (user or moderator)
    });
  }

  validate(req: Request, email: string, password: string) {
    const isMod = req.body.isMod;
    const user = this.authService.validateLogin(email, password, isMod);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
