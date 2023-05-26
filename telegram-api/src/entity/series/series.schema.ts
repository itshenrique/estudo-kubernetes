import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export class EpisodeModel {
  number: number;
  airdate: Date;
}

export class SeasonModel {
  number: number;
  episodes: EpisodeModel[];
}

@Schema()
export class SeriesModel {
  @Prop({ unique: true, index: true })
  uuid: string;

  @Prop({ unique: true, index: true })
  name: string;

  @Prop({ unique: true, index: true })
  imdbId: string;

  @Prop()
  seasons: SeasonModel[];
}
export type UserDocument = HydratedDocument<SeriesModel>;
export const SeriesSchema = SchemaFactory.createForClass(SeriesModel);

export const SeriesFeature: ModelDefinition = {
  name: SeriesModel.name,
  schema: SeriesSchema,
  collection: 'series',
};
