import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Artist } from './artist.schema';

@Schema()
export class Album {
  @Prop({ required: true })
  name: string;

  @Prop({ ref: Artist.name, required: true })
  artist: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  yearOfIssue: number;

  @Prop()
  image: string;
}

export const AlbumSchema = SchemaFactory.createForClass(Album);
export type AlbumDocument = Album & Document;
