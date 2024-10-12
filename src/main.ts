import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as log4js from 'log4js';
import log4jsConfig from '@/config/log4js.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 타입이 명시된 log4js 설정 사용
  log4js.configure(log4jsConfig as log4js.Configuration);

  const logger = log4js.getLogger();
  app.useLogger(logger);

  await app.listen(3456);
}
bootstrap();
