import { Module } from '@nestjs/common';
import { ExtractorService } from './extractor.service';
import { ExtractorController } from './extractor.controller';
import { ProviderModule } from "../provider/provider.module";

@Module({
  imports: [ProviderModule],
  controllers: [ExtractorController],
  providers: [ExtractorService],
})
export class ExtractorModule {}
