import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { atlasMongo } from '../config';
import mongoose from 'mongoose';

mongoose.set('debug', true);

@Module({
  imports: [
    MongooseModule.forRoot(atlasMongo.mongoUri, {
      connectionName: atlasMongo.mongoConnectionIdentifier,
    }),
  ],
})
export class EntertainmentDbModule {}
