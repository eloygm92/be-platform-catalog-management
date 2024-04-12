import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete, UseGuards
} from "@nestjs/common";
import { WatchlistService } from './watchlist.service';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto';
import { AccessTokenGuard } from "../auth/guards/accessToken.guard";

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() createWatchlistDto: CreateWatchlistDto) {
    return this.watchlistService.create(createWatchlistDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get(':user')
  findAll(
    @Param('user') user: string,
  ) {
    return this.watchlistService.findAll(+user);
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.watchlistService.findOne(+id);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWatchlistDto: UpdateWatchlistDto,
  ) {
    return this.watchlistService.update(+id, updateWatchlistDto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':user/:watchable')
  remove(
    @Param('user') user_id: string,
    @Param('watchable') watchable_id: string
  ) {
    return this.watchlistService.remove(+user_id, +watchable_id);
  }
}
