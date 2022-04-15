import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import * as csurf from "csurf";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("dmechat")
    .setDescription("Server for dmechat")
    .setVersion("0.0.1")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  app.use(helmet());
  app.use(csurf())
  app.enableCors(); // TODO: Fix this. CORS is enabled for all origins
  await app.listen(3000);
}
bootstrap();
