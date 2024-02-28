import { Module } from '@nestjs/common';
import { ExtractorService } from './extractor.service';
import { ExtractorController } from './extractor.controller';
import { ProviderModule } from '../provider/provider.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Watchable } from '../watchable/entities/watchable.entity';
import { Genre } from '../watchable/entities/genre.entity';
import { Season } from '../season/entities/season.entity';
import { Episode } from '../episode/entities/episode.entity';

@Module({
  imports: [
    ProviderModule,
    TypeOrmModule.forFeature([Watchable, Genre, Season, Episode]),
  ],
  controllers: [ExtractorController],
  providers: [ExtractorService],
})
export class ExtractorModule {}
