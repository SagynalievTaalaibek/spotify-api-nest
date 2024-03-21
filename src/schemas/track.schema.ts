import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Album } from './album.schema';

@Schema()
export class Track {
  @Prop({ required: true })
  name: string;

  @Prop({ ref: Album.name, required: true })
  album: mongoose.Schema.Types.ObjectId;

  @Prop()
  duration: string;

  @Prop({ required: true })
  albumTrackNumber: number;
}

export const TrackSchema = SchemaFactory.createForClass(Track);
export type TrackDocument = Track & Document;
