import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as path from 'path';
import * as fs from 'fs';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exceptions.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { WinstonLogger } from './config/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Movies API')
    .setDescription('The Movies API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    const res = fs.mkdirSync(logDir, { recursive: true });
    console.log('res', res);
  }
  const logger = app.get(WinstonLogger);
  app.useGlobalInterceptors(new LoggingInterceptor(logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().then(
  () => console.log('Application started successfully'),
  (err) => {
    console.error('Error during bootstrap:', err);
    process.exit(1);
  },
);
