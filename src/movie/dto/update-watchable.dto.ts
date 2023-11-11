import { PartialType } from '@nestjs/mapped-types';
import { CreateWatchableDto } from './create-watchable.dto';

export class UpdateWatchableDto extends PartialType(CreateWatchableDto) {}
