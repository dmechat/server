import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import * as express from 'express';
import { INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as serverlessExpress from 'aws-serverless-express';
import { Server } from 'http';

async function setupApp(app: INestApplication) {
  // const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("dmechat")
    .setDescription("Server for dmechat")
    .setVersion("0.0.1")
    .addSecurity("ID_TOKEN", { type: "apiKey", in: "header", name: "Authorization" })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  app.use(helmet());
  // app.use(csurf());
  app.enableCors(); // TODO: Fix this. CORS is enabled for all origins
  // await app.listen(process.env.PORT || 8080);
  return app;
}

export async function bootstrapLocalhost(adapter: any) {
  const app = await NestFactory.create(AppModule);
  return setupApp(app);
}

if (process.env.LOCAL_EXECUTION) {
  console.log("process.env.LOCAL_EXECUTION", process.env.LOCAL_EXECUTION, process.env.VERSION)
  bootstrapLocalhost(undefined).then(async app => {
    await app.listen(7071);
  });
}

async function bootstrapAWS() {
  const expressServer = express();
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressServer));
  setupApp(nestApp);
  await nestApp.init();
  return serverlessExpress.createServer(expressServer);
}

let lambdaProxy: Server;
export const handler = (event: any, context: any) => {
  console.info("Event", { event });
  event.path = event.requestContext.path.replace(`/${process.env.ENVIRONMENT}`, "");
  console.info("Event After Update", { event });
  if (!lambdaProxy) {
    bootstrapAWS().then((server) => {
      lambdaProxy = server;
      serverlessExpress.proxy(lambdaProxy, event, context);
    });
  } else {
    serverlessExpress.proxy(lambdaProxy, event, context);
  }
}