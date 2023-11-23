import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AmoCRMToken } from 'model/entities/amoCRMToken.entity';
import { AmoCRMInfo } from 'model/entities/amoCRMInfo.entity';
import { ContactsService } from './contacts.service';
import { LeadsService } from './leads.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ...require('../config/typeorm.config'),
    }),
    TypeOrmModule.forFeature([AmoCRMToken, AmoCRMInfo]),
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, ContactsService, LeadsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
