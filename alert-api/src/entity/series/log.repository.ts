import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { atlasMongo } from 'src/infra/config';
import { v4 as uuidv4 } from 'uuid';
import { LogModel } from './log.schema';
import { ILogRepository } from 'src/adapters';

@Injectable()
export class LogMongoRepository implements ILogRepository {
  constructor(
    @InjectModel(LogModel.name, atlasMongo.mongoConnectionIdentifier)
    private readonly SeriesModel: Model<LogModel>,
  ) {}

  save(body: Pick<LogModel, 'application' | 'message'>): Promise<LogModel> {
    const createdUser = new this.SeriesModel({
      ...body,
      uuid: uuidv4(),
    });
    return createdUser.save();
  }
}
