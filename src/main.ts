import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  VersioningType,
  VERSION_NEUTRAL,
  Logger,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { ExceptionFilter } from './common/filters';
import { AppModule } from './app.module';

const winstonColourizer = winston.format.colorize();
const options = {
  logger: WinstonModule.createLogger({
    level: process.env.LOG_LEVEL || 'verbose',
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf((info) => {
            const { timestamp, level, message, data, context, stack } = info;
            let logLine = `[${timestamp}] ${level} `;
            const logContext = context || (stack?.length ? stack[0] : '');
            if (logContext) {
              logLine += `${logContext} > ${message}`;
            } else {
              logLine += `${message}`;
            }
            if (typeof data === 'object' && Object.keys(data).length > 0) {
              logLine += `\n${JSON.stringify(data, null, 2)}`;
            }
            if (process.env.NO_COLOR !== 'true') {
              logLine = winstonColourizer.colorize(level, logLine);
            }
            return logLine;
          }),
        ),
      }),
    ],
  }),
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    options,
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // transform: true,
    }),
  );

  // cors checking
  app.enableCors({
    // allow CORS from '*' only for local and dev,
    // todo: change cors for production
    origin: process.env.NODE_ENV === 'production' ? /.*\.example\.com$/ : '*',
  });
  app.disable('x-powered-by');
  app.disable('etag');

  app.useGlobalFilters(new ExceptionFilter());

  // versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [VERSION_NEUTRAL, '1'],
  });

  const logger = app.get(Logger);
  logger.verbose(
    `
    ********************* WELCOME TO API GATEWAY *********************
    To see api gateway in action, go to
    http://localhost:${process.env.REST_API_GATEWAY_PORT || 3000}
    **************************************************************
    `,
    'bootstrap',
  );

  await app.listen(process.env.REST_API_GATEWAY_PORT || 3000);
}

bootstrap();
