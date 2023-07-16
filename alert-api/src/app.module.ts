import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { AppController } from './app.controller';
import { EntertainmentDbModule } from './infra/db/entertainmentDb.module';
import { LogModule } from './entity/series/log.module';

@Module({
  imports: [EntertainmentDbModule, LogModule],
  providers: [AppService],
  controllers: [AppController, HealthController],
})
export class AppModule {}
