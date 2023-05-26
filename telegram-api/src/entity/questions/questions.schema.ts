import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
class ChoiceModel {
  @Prop()
  answer: string;

  @Prop()
  imdbId: string;

  @Prop()
  name: string;

  @Prop()
  poster: string;
}

@Schema()
export class QuestionsModel {
  @Prop({ unique: true, index: true })
  uuid: string;

  @Prop({ unique: true, index: true })
  userUuid: string;

  @Prop()
  choices: ChoiceModel[];

  @Prop({ default: new Date() })
  readonly lastModifiedDate: Date;
}

export type QuestionsDocument = HydratedDocument<QuestionsModel>;
export const QuestionsSchema = SchemaFactory.createForClass(QuestionsModel);

QuestionsSchema.index({ lastModifiedDate: 1 }, { expireAfterSeconds: 2 * 60 });

export const QuestionsFeature: ModelDefinition = {
  name: QuestionsModel.name,
  schema: QuestionsSchema,
  collection: 'questions',
};
