import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';
import { ProviderController } from './provider.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
import { AuthService } from "../auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { Role } from "../user/entities/role.entity";
import { User } from "../user/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Provider, User, Role])],
  controllers: [ProviderController],
  providers: [ProviderService, AuthService, JwtService],
  exports: [ProviderService],
})
export class ProviderModule {}
