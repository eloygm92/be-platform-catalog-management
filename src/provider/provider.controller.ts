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

@Controller('provider')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  create(@Body() createProviderDto: CreateProviderDto) {
    return this.providerService.create(createProviderDto);
  }

  @Get()
  findAll() {
    return this.providerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.providerService.findOne(id);
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
