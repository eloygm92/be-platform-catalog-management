import { Module } from '@nestjs/common';
import { WatchableService } from './watchable.service';
import { WatchableController } from './watchable.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Watchable } from './entities/watchable.entity';
import { Provider } from '../provider/entities/provider.entity';
import { Genre } from "./entities/genre.entity";
import { User } from "../user/entities/user.entity";
import { Role } from "../user/entities/role.entity";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../auth/auth.service";

@Module({
  imports: [TypeOrmModule.forFeature([Watchable, Provider, Genre, User, Role])],
  controllers: [WatchableController],
  providers: [WatchableService, AuthService, JwtService],
})
export class WatchableModule {}
