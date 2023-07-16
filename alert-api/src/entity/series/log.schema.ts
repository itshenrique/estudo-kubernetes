import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class LogModel {
  @Prop({ unique: true, index: true })
  uuid: string;

  @Prop({ index: true })
  application: string;

  @Prop()
  message: string;
}
export type LogDocument = HydratedDocument<LogModel>;
export const SeriesSchema = SchemaFactory.createForClass(LogModel);

export const LogFeature: ModelDefinition = {
  name: LogModel.name,
  schema: SeriesSchema,
  collection: 'logs',
};
