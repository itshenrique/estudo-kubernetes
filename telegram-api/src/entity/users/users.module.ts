import { Module } from '@nestjs/common';
import { UsersFeature } from './users.schema';
import { atlasMongo } from 'src/infra/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersMongoRepository } from './users.repository';

@Module({
  imports: [
    MongooseModule.forFeature(
      [UsersFeature],
      atlasMongo.mongoConnectionIdentifier,
    ),
  ],
  providers: [
    UsersMongoRepository,
    {
      provide: 'UserRepository',
      useExisting: UsersMongoRepository,
    },
  ],
  exports: [
    {
      provide: 'UserRepository',
      useExisting: UsersMongoRepository,
    },
  ],
})
export class UsersModule {}
