import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password: string;
}

export class AuthDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
