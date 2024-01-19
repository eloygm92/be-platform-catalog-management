import { Module } from '@nestjs/common';
import { WatchableService } from './watchable.service';
import { WatchableController } from './watchable.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Watchable } from './entities/watchable.entity';
import { Provider } from '../provider/entities/provider.entity';
import { Genre } from "./entities/genre.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Watchable, Provider, Genre])],
  controllers: [WatchableController],
  providers: [WatchableService],
})
export class WatchableModule {}
