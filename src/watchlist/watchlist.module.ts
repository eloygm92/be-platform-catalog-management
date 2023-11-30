import { Module } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { WatchlistController } from './watchlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Watchlist } from './entities/watchlist.entity';
import { Watchable } from '../watchable/entities/watchable.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Watchlist, User, Watchable])],
  controllers: [WatchlistController],
  providers: [WatchlistService],
})
export class WatchlistModule {}
