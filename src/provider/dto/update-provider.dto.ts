import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderDto } from './create-provider.dto';
import { IsOptional } from "class-validator";

export class UpdateProviderDto extends PartialType(CreateProviderDto) {
  @IsOptional()
  deleted_at?: Date;
}
