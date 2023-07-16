import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { atlasMongo } from 'src/infra/config';
import { v4 as uuidv4 } from 'uuid';
import { QuestionsModel } from './questions.schema';
import { IQuestionRepository } from 'src/adapters/iquestion.repository';

@Injectable()
export class QuestionsMongoRepository implements IQuestionRepository {
  constructor(
    @InjectModel(QuestionsModel.name, atlasMongo.mongoConnectionIdentifier)
    private readonly questionsModel: Model<QuestionsModel>,
  ) {}

  findByUuid(body: Pick<QuestionsModel, 'uuid'>): Promise<QuestionsModel> {
    return this.questionsModel.findOne(body);
  }

  findByUserUuid(
    body: Pick<QuestionsModel, 'userUuid'>,
  ): Promise<QuestionsModel> {
    return this.questionsModel.findOne(body);
  }

  async deleteOneByUserUuid(
    body: Pick<QuestionsModel, 'userUuid'>,
  ): Promise<boolean> {
    const result = await this.questionsModel.deleteOne(body);
    return result.deletedCount === 1;
  }

  async updateQuestion(
    body: Omit<QuestionsModel, 'uuid' | 'lastModifiedDate'>,
  ): Promise<boolean> {
    const result = await this.questionsModel.updateOne(
      { userUuid: body.userUuid },
      {
        $set: {
          ...body,
          uuid: uuidv4(),
        },
      },
      { upsert: true },
    );

    return result.upsertedCount === 1;
  }
}
