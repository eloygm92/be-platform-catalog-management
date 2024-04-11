import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
import { JwtPayload } from '../strategies/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class AdminUseGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const payload: JwtPayload = this.jwtService.decode(
      ExtractJwt.fromAuthHeaderAsBearerToken()(request),
    );

    if (!payload) {
      return false;
    } else {
      return await this.authService.validateAdminUser(payload);
    }
  }
}
