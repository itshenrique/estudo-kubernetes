import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { LoggingInterceptor } from './infra/interceptor/request.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const service = app.get<AppService>(AppService);
  app.useGlobalInterceptors(new LoggingInterceptor());
  service.startEventListener();
  await app.listen(3001);
}
bootstrap();
