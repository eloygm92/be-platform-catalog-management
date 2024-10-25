import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Role } from '../entities/role.entity';
import { Provider } from '../../provider/entities/provider.entity';

export class CreateUserDto {
  @IsOptional()
  id: number;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  role: Role;

  @IsOptional()
  providers: Provider[];

  @IsOptional()
  avatar_img: string;
}
