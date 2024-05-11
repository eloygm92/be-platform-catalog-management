import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class ChangePasswordStrategy extends PassportStrategy(
  Strategy,
  'jwt-change-password',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.CHANGE_PASSWORD_SECRET,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const changePasswordToken = req
      .get('Authorization')
      .replace('Bearer', '')
      .trim();
    return { ...payload, changePasswordToken };
  }
}
