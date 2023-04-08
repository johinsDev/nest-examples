import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // This is required for class-validator to work with NestJS injection
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(3000);
}

bootstrap();
// helath
// helmet
// compression
// cache
// fastify
// swagger
// @nestjs/schedule
// ioredis
// rate limitting
// mailer forRootasync
