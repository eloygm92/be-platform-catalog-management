import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSeasonDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNotEmpty()
  @IsNumber()
  season_number: number;

  @IsOptional()
  @IsString()
  overview: string;

  @IsOptional()
  @IsString()
  air_date: Date;

  @IsOptional()
  @IsString()
  poster_path: string;

  @IsOptional()
  @IsNumber()
  vote_average: number;

  @IsOptional()
  @IsNumber()
  vote_count: number;

  @IsOptional()
  @IsNumber()
  watchable: number;
}
