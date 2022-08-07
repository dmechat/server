import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService, FirebaseService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth/auth.controller';
import { ChatsController } from './controllers/chats/chats.controller';
import { AuthService } from './controllers/auth/auth.service';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';


@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, AuthController, ChatsController],
  providers: [
    AppService, Logger, FirebaseService, AuthService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    }
  ],
})
export class AppModule { }
