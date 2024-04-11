import { Module } from '@nestjs/common';
import { SeasonService } from './season.service';
import { SeasonController } from './season.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './entities/season.entity';
import { Watchable } from '../watchable/entities/watchable.entity';
import { AuthService } from "../auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "../user/entities/user.entity";
import { Role } from "../user/entities/role.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Season, Watchable, User, Role])],
  controllers: [SeasonController],
  providers: [SeasonService, AuthService, JwtService],
})
export class SeasonModule {}
