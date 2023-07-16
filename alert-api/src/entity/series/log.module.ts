import { Module } from '@nestjs/common';
import { LogFeature } from './log.schema';
import { atlasMongo } from 'src/infra/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LogMongoRepository } from './log.repository';

@Module({
  imports: [
    MongooseModule.forFeature(
      [LogFeature],
      atlasMongo.mongoConnectionIdentifier,
    ),
  ],
  providers: [
    LogMongoRepository,
    {
      provide: 'LogRepository',
      useExisting: LogMongoRepository,
    },
  ],
  exports: [
    {
      provide: 'LogRepository',
      useExisting: LogMongoRepository,
    },
  ],
})
export class LogModule {}
