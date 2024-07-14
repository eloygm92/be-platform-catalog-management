import { Controller, Get } from '@nestjs/common';
import { ExtractorService } from './extractor.service';
import { Cron } from "@nestjs/schedule";

@Controller('extractor')
export class ExtractorController {
  constructor(private readonly extractorService: ExtractorService) {}

  @Cron('0 30 4 * * *')
  @Get('providers')
  findAll() {
    return this.extractorService.getProviders();
  }

  @Cron('0 40 4 * * *')
  @Get('movies/upcoming')
  getUpcomingMovies() {
    return this.extractorService.getUpcomingMovies();
  }

  @Cron('0 30 5 * * *')
  @Get('tv/upcoming')
  getUpcomingTv() {
    return this.extractorService.getAiringTodaySeries();
  }
}
