import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { AppController } from './app.controller';
import { EntertainmentDbModule } from './infra/db/entertainmentDb.module';
import { UsersModule } from './entity/users/users.module';
import { SeriesModule } from './entity/series/series.module';
import { OmdbModule } from './omdb/omdb.module';
import { QuestionModule } from './entity/questions/questions.module';

@Module({
  imports: [
    EntertainmentDbModule,
    UsersModule,
    SeriesModule,
    QuestionModule,
    OmdbModule,
  ],
  providers: [AppService],
  controllers: [AppController, HealthController],
})
export class AppModule {}
