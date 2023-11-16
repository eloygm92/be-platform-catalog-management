import { PartialType } from '@nestjs/mapped-types';
import { CreateExtractorDto } from './create-extractor.dto';

export class UpdateExtractorDto extends PartialType(CreateExtractorDto) {}
