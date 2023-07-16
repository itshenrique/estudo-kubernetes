import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class UsersModel {
  @Prop({ unique: true, index: true })
  uuid: string;

  @Prop({ unique: true, index: true })
  telegramId: number;

  @Prop()
  name: string;

  @Prop()
  seriesUuid: string[];
}
export type UsersDocument = HydratedDocument<UsersModel>;
export const UsersSchema = SchemaFactory.createForClass(UsersModel);

export const UsersFeature: ModelDefinition = {
  name: UsersModel.name,
  schema: UsersSchema,
  collection: 'users',
};
