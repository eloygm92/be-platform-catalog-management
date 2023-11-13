import { Module } from '@nestjs/common';
import { SeasonService } from './season.service';
import { SeasonController } from './season.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from './entities/season.entity';
import { Watchable } from '../movie/entities/watchable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Season, Watchable])],
  controllers: [SeasonController],
  providers: [SeasonService],
})
export class SeasonModule {}
