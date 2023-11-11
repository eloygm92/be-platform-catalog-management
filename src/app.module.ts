import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user/entities/user.entity";
import { ProviderModule } from './provider/provider.module';
import { Provider } from "./provider/entities/provider.entity";
import { WatchableModule } from './movie/watchable.module';
import { Watchable } from "./movie/entities/watchable.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Provider, Watchable],
      synchronize: false,
    }),
    UserModule,
    ProviderModule,
    WatchableModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
