import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  VersioningType,
  VERSION_NEUTRAL,
  Logger,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // transform: true,
    }),
  );

  // setting headers
  app.enableCors({
    // allow CORS from '*' only for local and dev
    origin: process.env.NODE_ENV === 'production' ? /.*\.example\.com$/ : '*',
  });
  app.disable('x-powered-by');
  app.disable('etag');

  // versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [VERSION_NEUTRAL, '1'],
  });

  // if (process.env.NODE_ENV !== 'production') {
  const logger = app.get(Logger);
  logger.verbose(
    `
    ********************* WELCOME TO API GATEWAY *********************
    To see gateway in action, go to
    http://localhost:${process.env.REST_API_GATEWAY_PORT || 3000}
    **************************************************************
    `,
    'bootstrap',
  );
  // }

  await app.listen(process.env.REST_API_GATEWAY_PORT || 3000);
}

bootstrap();
