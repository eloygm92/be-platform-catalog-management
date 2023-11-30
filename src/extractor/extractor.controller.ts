import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExtractorService } from './extractor.service';
import { UpdateExtractorDto } from './dto/update-extractor.dto';

@Controller('extractor')
export class ExtractorController {
  constructor(private readonly extractorService: ExtractorService) {}

  /*@Post()
  create(@Body() createExtractorDto: CreateExtractorDto) {
    return this.extractorService.create(createExtractorDto);
  }*/

  @Get('providers')
  findAll() {
    return this.extractorService.getProviders();
  }

  /*@Get(':id')
  findOne(@Param('id') id: string) {
    return this.extractorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExtractorDto: UpdateExtractorDto) {
    return this.extractorService.update(+id, updateExtractorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.extractorService.remove(+id);
  }*/
}
