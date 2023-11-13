import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WatchableService } from './watchable.service';
import { CreateWatchableDto } from './dto/create-watchable.dto';
import { UpdateWatchableDto } from './dto/update-watchable.dto';

@Controller('watchable')
export class WatchableController {
  constructor(private readonly watchableService: WatchableService) {}

  @Post()
  create(@Body() createWatchableDto: CreateWatchableDto) {
    return this.watchableService.create(createWatchableDto);
  }

  @Get()
  findAll() {
    return this.watchableService.findAll();
  }

  @Get('movies')
  findMovies() {
    return this.watchableService.findAll('movie');
  }
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.watchableService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateMovieDto: UpdateWatchableDto) {
    return this.watchableService.update(+id, updateMovieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.watchableService.remove(+id);
  }
}
