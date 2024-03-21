import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { CreateAlbumDto } from './create-album.dto';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name)
    private albumModel: Model<AlbumDocument>,
  ) {}
  @Post()
  @UseInterceptors(
    FileInterceptor('image', { dest: './public/uploads/albums' }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() albumData: CreateAlbumDto,
  ) {
    const album = new this.albumModel({
      name: albumData.name,
      artist: albumData.artist,
      yearOfIssue: albumData.yearOfIssue,
      image: file ? '/uploads/albums/' + file.filename : null,
    });

    return album.save();
  }

  @Get()
  getAll(@Query('artistId') artistId: string) {
    if (artistId) {
      return this.albumModel.find({ artist: artistId }).populate('artist');
    }

    return this.albumModel.find();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const album = await this.albumModel.findById(id);

    if (!album) {
      throw new NotFoundException('Not such album');
    }

    return album;
  }

  @Delete(':id')
  deleteArtist(@Param('id') id: string) {
    return this.albumModel.findByIdAndDelete(id);
  }
}
