import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Track, TrackDocument } from '../schemas/track.schema';
import { CreateTrackDto } from './create-track.dto';

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>,
  ) {}
  @Post()
  create(@Body() trackData: CreateTrackDto) {
    const track = new this.trackModel({
      name: trackData.name,
      album: trackData.album,
      duration: trackData.duration,
      albumTrackNumber: trackData.albumTrackNumber,
    });

    return track.save();
  }

  @Get()
  getAll(@Query('albumId') albumId: string) {
    if (albumId) {
      return this.trackModel
        .find({ album: albumId })
        .populate('album')
        .sort({ albumTrackNumber: 1 });
    }

    return this.trackModel.find().populate('album');
  }

  @Delete(':id')
  deleteArtist(@Param('id') id: string) {
    return this.trackModel.findByIdAndDelete(id);
  }
}
