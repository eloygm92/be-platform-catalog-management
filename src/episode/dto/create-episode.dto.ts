import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEpisodeDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNotEmpty()
  @IsNumber()
  season: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  episode_number: number;

  @IsOptional()
  @IsString()
  overview: string;

  @IsOptional()
  @IsNumber()
  vote_average: number;

  @IsOptional()
  @IsNumber()
  vote_count: number;
}
