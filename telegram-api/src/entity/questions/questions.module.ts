import { Module } from '@nestjs/common';
import { QuestionsFeature } from './questions.schema';
import { atlasMongo } from 'src/infra/config';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionsMongoRepository } from './questions.repository';

@Module({
  imports: [
    MongooseModule.forFeature(
      [QuestionsFeature],
      atlasMongo.mongoConnectionIdentifier,
    ),
  ],
  providers: [
    QuestionsMongoRepository,
    {
      provide: 'QuestionRepository',
      useExisting: QuestionsMongoRepository,
    },
  ],
  exports: [
    {
      provide: 'QuestionRepository',
      useExisting: QuestionsMongoRepository,
    },
  ],
})
export class QuestionModule {}
