import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService, FirebaseService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth/auth.controller';
import { ChatsController } from './controllers/chats/chats.controller';
import { AuthService } from './controllers/auth/auth.service';


@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, AuthController, ChatsController],
  providers: [AppService, Logger, FirebaseService, AuthService],
})
export class AppModule { }
