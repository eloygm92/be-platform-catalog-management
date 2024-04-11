import { Module } from '@nestjs/common';
import { EpisodeService } from './episode.service';
import { EpisodeController } from './episode.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Episode } from './entities/episode.entity';
import { Season } from '../season/entities/season.entity';
import { Role } from "../user/entities/role.entity";
import { User } from "../user/entities/user.entity";
import { AuthService } from "../auth/auth.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [TypeOrmModule.forFeature([Episode, Season, User, Role])],
  controllers: [EpisodeController],
  providers: [EpisodeService, AuthService, JwtService],
})
export class EpisodeModule {}
