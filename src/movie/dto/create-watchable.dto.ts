import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateWatchableDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  original_name: string;

  @IsNotEmpty()
  @IsString()
  external_id: number;

  @IsOptional()
  @IsNumber()
  vote_average: number;

  @IsOptional()
  @IsNumber()
  vote_count: number;

  @IsNotEmpty()
  @IsString()
  overview: string;

  @IsOptional()
  providers: number[];
}
