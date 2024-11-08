import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards
} from "@nestjs/common";
import { WatchableService } from './watchable.service';
import { CreateWatchableDto } from './dto/create-watchable.dto';
import { UpdateWatchableDto } from './dto/update-watchable.dto';
import { Pagination, PaginationParams } from "../helpers/decorators/params-params.decorator";
import { Sorting, SortingParams } from "../helpers/decorators/sorting-params.decorator";
import { Filtering, FilteringParams } from "../helpers/decorators/filtering-params.decorator";
import { AdminUseGuard } from "../auth/guards/adminUse.guard";

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
    @SortingParams(['id', 'type', 'watchable.name', 'external_id', 'release_date', 'popularity', 'vote_average', 'vote_count', 'genres']) sort?: Sorting,
    @FilteringParams(['id', 'type', 'watchable.name', 'external_id', 'release_date', 'popularity', 'vote_average', 'vote_count', 'genres.id', 'provider.id']) filter?: Filtering[],
  ) {
    return this.watchableService.findAll(paginationParams, sort, filter);
  }

  @Get('movies')
  findMovies(
    @PaginationParams() paginationParams: Pagination,
    @SortingParams(['id', 'type', 'watchable.name', 'external_id', 'release_date', 'popularity', 'vote_average', 'vote_count', 'genres']) sort?: Sorting,
    @FilteringParams(['id', 'type', 'watchable.name', 'external_id', 'release_date', 'popularity', 'vote_average', 'vote_count', 'genres.id', 'provider.id']) filter?: Filtering[],
  ) {
    if (!filter) {
      filter = [{ property: 'type', rule: 'eq', value: 'movie' } as Filtering];
    }

    return this.watchableService.findAll(paginationParams, sort, filter);
  }

  @Get('series')
  findSeries(
    @PaginationParams() paginationParams: Pagination,
    @SortingParams(['id', 'type', 'watchable.name', 'external_id', 'release_date', 'popularity', 'vote_average', 'vote_count', 'genres',]) sort?: Sorting,
    @FilteringParams(['id', 'type', 'watchable.name', 'external_id', 'release_date', 'popularity', 'vote_average', 'vote_count', 'genres.id', 'provider.id']) filter?: Filtering[],
  ) {
    if (!filter) {
      filter = [{ property: 'type', rule: 'eq', value: 'tv' } as Filtering];
    }

    return this.watchableService.findAll(paginationParams, sort, filter);
  }

  @Get('genre')
  getGenres() {
    return this.watchableService.getGenres();
  }

  @Get('select/:search')
  findAllSelect(@Param('search') search: string) {
    return this.watchableService.findAllSelect(search);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.watchableService.findOne(+id);
  }

  @UseGuards(AdminUseGuard)
  @Get('deactivate/:id')
  deactivate(@Param('id') id: number) {
    return this.watchableService.deactivate(id);
  }

  @UseGuards(AdminUseGuard)
  @Get('restore/:id')
  restore(@Param('id') id: number) {
    return this.watchableService.restore(id);
  }

  @UseGuards(AdminUseGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateMovieDto: UpdateWatchableDto) {
    return this.watchableService.update(+id, updateMovieDto);
  }

  @UseGuards(AdminUseGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.watchableService.remove(+id);
  }
}
