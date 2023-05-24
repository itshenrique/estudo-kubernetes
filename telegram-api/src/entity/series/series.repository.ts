import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { atlasMongo } from 'src/infra/config';
import { v4 as uuidv4 } from 'uuid';
import { SeriesModel } from './series.schema';
import { ISerieRepository } from 'src/adapters';

@Injectable()
export class SeriesMongoRepository implements ISerieRepository {
  constructor(
    @InjectModel(SeriesModel.name, atlasMongo.mongoConnectionIdentifier)
    private readonly SeriesModel: Model<SeriesModel>,
  ) {}

  findByUuid(body: Pick<SeriesModel, 'uuid'>): Promise<SeriesModel> {
    return this.SeriesModel.findOne(body);
  }

  findByImdbId(body: Pick<SeriesModel, 'imdbId'>): Promise<SeriesModel> {
    return this.SeriesModel.findOne(body);
  }

  findByName({ name }: Pick<SeriesModel, 'name'>): Promise<SeriesModel> {
    const pattern = `^${name}$`;
    return this.SeriesModel.findOne({
      name: new RegExp(pattern, 'i'),
    });
  }

  findInUuidArray(uuidArray: string[]): Promise<SeriesModel[]> {
    return this.SeriesModel.find({
      uuid: {
        $in: uuidArray,
      },
    });
  }

  save(body: Pick<SeriesModel, 'name' | 'imdbId'>): Promise<SeriesModel> {
    const createdUser = new this.SeriesModel({
      ...body,
      uuid: uuidv4(),
    });
    return createdUser.save();
  }
}
