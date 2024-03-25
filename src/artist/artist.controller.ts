import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import mongoose, { Model } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateArtistDto } from './create-artist.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';

@Controller('artists')
export class ArtistController {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<ArtistDocument>,
  ) {}

  @UseGuards(TokenAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('photo', { dest: './public/uploads/artists' }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistData: CreateArtistDto,
  ) {
    try {
      const artist = new this.artistModel({
        name: artistData.name,
        description: artistData.description,
        photo: file ? '/uploads/artists/' + file.filename : null,
      });

      await artist.save();

      return artist;
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }

  @Get()
  getAll() {
    return this.artistModel.find();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const artist = await this.artistModel.findById(id);

    if (!artist) {
      throw new NotFoundException('Not such artist');
    }

    return artist;
  }

  @Delete(':id')
  deleteArtist(@Param('id') id: string) {
    return this.artistModel.findByIdAndDelete(id);
  }
}
