import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProviderDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  external_id: number;

  @IsNotEmpty()
  @IsString()
  logo_path: string;
}
