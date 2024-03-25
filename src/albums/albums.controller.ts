import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  SetMetadata,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { CreateAlbumDto } from './create-album.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RoleGuard } from '../auth/role.guard';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name)
    private albumModel: Model<AlbumDocument>,
  ) {}

  @UseGuards(TokenAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', { dest: './public/uploads/albums' }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() albumData: CreateAlbumDto,
  ) {
    try {
      const album = new this.albumModel({
        name: albumData.name,
        artist: albumData.artist,
        yearOfIssue: albumData.yearOfIssue,
        image: file ? '/uploads/albums/' + file.filename : null,
      });

      await album.save();

      return album;
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
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

  @SetMetadata('roles', ['admin'])
  @UseGuards(TokenAuthGuard, RoleGuard)
  @Delete(':id')
  deleteArtist(@Param('id') id: string) {
    return this.albumModel.findByIdAndDelete(id);
  }
}
