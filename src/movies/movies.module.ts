import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { WinstonLogger } from '../config/logger.config';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService, WinstonLogger],
  imports: [TypeOrmModule.forFeature([Movie])],
})
export class MoviesModule {}
