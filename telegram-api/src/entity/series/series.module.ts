import { Module } from '@nestjs/common';
import { SeriesFeature } from './series.schema';
import { atlasMongo } from 'src/infra/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SeriesMongoRepository } from './series.repository';

@Module({
  imports: [
    MongooseModule.forFeature(
      [SeriesFeature],
      atlasMongo.mongoConnectionIdentifier,
    ),
  ],
  providers: [
    SeriesMongoRepository,
    {
      provide: 'SerieRepository',
      useExisting: SeriesMongoRepository,
    },
  ],
  exports: [
    {
      provide: 'SerieRepository',
      useExisting: SeriesMongoRepository,
    },
  ],
})
export class SeriesModule {}
