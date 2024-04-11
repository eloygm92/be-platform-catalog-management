import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete, UseGuards
} from "@nestjs/common";
import { SeasonService } from './season.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { AdminUseGuard } from "../auth/guards/adminUse.guard";

@Controller('season')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Post()
  create(@Body() createSeasonDto: CreateSeasonDto) {
    return this.seasonService.create(createSeasonDto);
  }

  @Get()
  findAll() {
    return this.seasonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seasonService.findOne(+id);
  }

  @UseGuards(AdminUseGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeasonDto: UpdateSeasonDto) {
    return this.seasonService.update(+id, updateSeasonDto);
  }

  @UseGuards(AdminUseGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seasonService.remove(+id);
  }
}
