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
import { Pagination, PaginationParams } from "../helpers/decorators/params-params.decorator";
import { Sorting, SortingParams } from "../helpers/decorators/sorting-params.decorator";
import { Filtering, FilteringParams } from "../helpers/decorators/filtering-params.decorator";

@Controller('watchable')
export class WatchableController {
  constructor(private readonly watchableService: WatchableService) {}

  @Post()
  create(@Body() createWatchableDto: CreateWatchableDto) {
    return this.watchableService.create(createWatchableDto);
  }

  @Get()
  findAll(
    @PaginationParams() paginationParams: Pagination,
    @SortingParams(['id', 'type', 'name', 'external_id', 'release_date', 'popularity', 'vote_average', 'genres', 'popularity']) sort?: Sorting,
    @FilteringParams(['id', 'type', 'name', 'external_id', 'release_date', 'popularity', 'vote_average', 'genres.id']) filter?: Filtering[],
  ) {
    return this.watchableService.findAll(paginationParams, sort, filter);
  }

  @Get('movies')
  findMovies(
    @PaginationParams() paginationParams: Pagination,
    @SortingParams(['id', 'type', 'name', 'external_id', 'release_date', 'popularity', 'vote_average', 'genres', 'popularity']) sort?: Sorting,
    @FilteringParams(['id', 'type', 'name', 'external_id', 'release_date', 'popularity', 'vote_average', 'genres.id']) filter?: Filtering[],
  ) {
    if (!filter) {
      filter = [{ property: 'type', rule: 'eq', value: 'movie' } as Filtering];
    }

    return this.watchableService.findAll(paginationParams, sort, filter);
  }

  @Get('series')
  findSeries(
    @PaginationParams() paginationParams: Pagination,
    @SortingParams(['id', 'type', 'name', 'external_id', 'release_date', 'popularity', 'vote_average', 'genres', 'popularity']) sort?: Sorting,
    @FilteringParams(['id', 'type', 'name', 'external_id', 'release_date', 'popularity', 'vote_average', 'genres.id']) filter?: Filtering[],
  ) {
    if (!filter) {
      filter = [{ property: 'type', rule: 'eq', value: 'tv' } as Filtering];
    }

    return this.watchableService.findAll(paginationParams, sort, filter);
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
