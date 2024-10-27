import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as log4js from 'log4js';
import log4jsConfig from '@/config/log4js.config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3001'], // 허용할 도메인 배열
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 허용할 HTTP 메서드
    credentials: true, // 쿠키와 인증 정보를 허용할지 여부
  });
  log4js.configure(log4jsConfig as log4js.Configuration);
  app.use(cookieParser());

  const logger = log4js.getLogger();
  app.useLogger(logger);

  await app.listen(3456);
}
bootstrap();
