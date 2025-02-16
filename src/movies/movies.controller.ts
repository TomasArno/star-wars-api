import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Param,
  ValidationPipe,
  Query,
  BadRequestException,
  Patch,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { SearchMovieDto } from './dto/search-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movies')
@UseGuards(JwtAuthGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async createMovie(
    @Body(
      new ValidationPipe({
        whitelist: true,
      }),
    )
    movieDto: CreateMovieDto,
  ) {
    return this.moviesService.create(movieDto);
  }

  @Get()
  async getMovies(
    @Query(ValidationPipe) filters: SearchMovieDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.moviesService.findAll(filters, page, limit);
  }

  @Get(':id')
  @Roles(UserRole.USER)
  async getMovie(@Param('id') id: string) {
    if (!id) throw new BadRequestException('ID is required');

    return this.moviesService.findOneById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async updateMovie(
    @Param('id') id: string,
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    movie: UpdateMovieDto,
  ) {
    if (!id) throw new BadRequestException('ID is required');

    return this.moviesService.update(id, movie);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deleteMovie(@Param('id') id: string): Promise<void> {
    if (!id) throw new BadRequestException('ID is required');

    return this.moviesService.delete(id);
  }

  @Post('sync')
  @Roles(UserRole.ADMIN)
  async syncMovies(): Promise<void> {
    return this.moviesService.syncWithStarWarsAPI();
  }
}
