import { Controller, Get } from '@nestjs/common';
import { ExtractorService } from './extractor.service';

@Controller('extractor')
export class ExtractorController {
  constructor(private readonly extractorService: ExtractorService) {}

  @Get('providers')
  findAll() {
    return this.extractorService.getProviders();
  }

  @Get('movies/upcoming')
  getUpcomingMovies() {
    return this.extractorService.getUpcomingMovies();
  }
}
