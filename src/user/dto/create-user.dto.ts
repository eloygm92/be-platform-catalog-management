import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Role } from '../entities/role.entity';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  role: Role;
}
