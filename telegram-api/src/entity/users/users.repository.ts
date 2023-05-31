import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { atlasMongo } from 'src/infra/config';
import { v4 as uuidv4 } from 'uuid';
import { UsersModel } from './users.schema';
import { IUserRepository } from 'src/adapters';

@Injectable()
export class UsersMongoRepository implements IUserRepository {
  constructor(
    @InjectModel(UsersModel.name, atlasMongo.mongoConnectionIdentifier)
    private readonly usersModel: Model<UsersModel>,
  ) {}

  findByUuid(body: Pick<UsersModel, 'uuid'>): Promise<UsersModel> {
    return this.usersModel.findOne(body);
  }

  findByTelegramId(body: Pick<UsersModel, 'telegramId'>): Promise<UsersModel> {
    return this.usersModel.findOne(body);
  }

  save(body: Omit<UsersModel, 'uuid' | 'seriesUuid'>): Promise<UsersModel> {
    const createdUser = new this.usersModel({
      uuid: uuidv4(),
      telegramId: body.telegramId,
      name: body.name,
    });
    return createdUser.save();
  }

  async pushSerieUuidInUserByUuid(
    body: Pick<UsersModel, 'uuid'>,
    serieUuid: string,
  ): Promise<boolean> {
    const result = await this.usersModel.updateOne(
      { uuid: body.uuid },
      {
        $push: {
          seriesUuid: serieUuid,
        },
      },
    );

    return result.modifiedCount === 1;
  }

  async cleanSeriesFromUser(body: Pick<UsersModel, 'uuid'>): Promise<boolean> {
    const result = await this.usersModel.updateOne(
      { uuid: body.uuid },
      {
        $set: {
          seriesUuid: [],
        },
      },
    );

    return result.modifiedCount === 1;
  }

  async deleteSerieFromUser(
    body: Pick<UsersModel, 'uuid'>,
    seriesUuid: string,
  ): Promise<boolean> {
    const result = await this.usersModel.updateOne(
      { uuid: body.uuid },
      {
        $pull: {
          seriesUuid,
        },
      },
    );

    return result.modifiedCount === 1;
  }
}
