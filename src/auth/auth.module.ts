import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { GoogleStrategy } from "./strategies/google.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AccessTokenStrategy } from "./strategies/accessToken.strategy";
import { RefreshTokenStrategy } from "./strategies/refreshToken.strategy";
import { Role } from "../user/entities/role.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
