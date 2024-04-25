import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete, UseGuards
} from "@nestjs/common";
import { ProviderService } from './provider.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { AdminUseGuard } from "../auth/guards/adminUse.guard";
import { Pagination, PaginationParams } from "../helpers/decorators/params-params.decorator";
import { Sorting, SortingParams } from "../helpers/decorators/sorting-params.decorator";
import { Filtering, FilteringParams } from "../helpers/decorators/filtering-params.decorator";

@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  create(@Body() createProviderDto: CreateProviderDto) {
    return this.providerService.create(createProviderDto);
  }

  @Get()
  findAll(
    @PaginationParams() paginationParams: Pagination,
    @SortingParams() sort?: Sorting,
    @FilteringParams(['name']) filter?: Filtering[],
  ) {
    return this.providerService.findAll(paginationParams, sort, filter);
  }

  @Get('select')
  findAllSelect() {
    return this.providerService.findAllSelect();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.providerService.findOne(id);
  }

  @Get('watchable/:id')
  findProvidersByWatchableId(@Param('id') id: number) {
    return this.providerService.findProvidersByWatchableId(id);
  }

  @UseGuards(AdminUseGuard)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    return this.providerService.update(id, updateProviderDto);
  }

  @UseGuards(AdminUseGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.providerService.remove(+id);
  }
}
