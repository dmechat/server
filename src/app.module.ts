import { Module, Logger } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService, FirebaseService } from './app.service';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, Logger, FirebaseService],
})
export class AppModule { }
