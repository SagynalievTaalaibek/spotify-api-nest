import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  SetMetadata,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Track, TrackDocument } from '../schemas/track.schema';
import { CreateTrackDto } from './create-track.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RoleGuard } from '../auth/role.guard';

@Controller('tracks')
export class TracksController {
  @UseGuards(TokenAuthGuard)
  @Post()
  async create(@Body() trackData: CreateTrackDto) {
    try {
      const track = new this.trackModel({
        name: trackData.name,
        album: trackData.album,
        duration: trackData.duration,
        albumTrackNumber: trackData.albumTrackNumber,
      });

      await track.save();

      return track;
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }

  constructor(
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>,
  ) {}

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

  @SetMetadata('roles', ['admin'])
  @UseGuards(TokenAuthGuard, RoleGuard)
  @Delete(':id')
  deleteArtist(@Param('id') id: string) {
    return this.trackModel.findByIdAndDelete(id);
  }
}
