import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IFindMovie } from './interfaces/find-movie.interface';
import { CreateMovieDto } from './dto/create-movie.dto';
import { SearchMovieDto } from './dto/search-movie.dto';
import { Movie } from './entities/movie.entity';

import axios from 'axios';
import { addFilters } from './utils/add-filters.util';
import { parseId } from '../common/utils/parse-id.util';
import { checkEmptyObject } from '../common/utils/check-empty.util';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  private readonly logger = new Logger(MoviesService.name);

  async create(movieDto: CreateMovieDto): Promise<Movie> {
    try {
      checkEmptyObject(movieDto);

      const movie = this.movieRepository.create(movieDto);
      const newMovie = await this.movieRepository.save(movie);

      this.logger.log(`Movie has been created: ${JSON.stringify(movieDto)}`);

      return newMovie;
    } catch (error) {
      this.logger.error(`Error creating movie: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create movie');
    }
  }

  async findAll(filters: SearchMovieDto, page: number = 1, limit: number = 20) {
    try {
      const queryBuilder = addFilters(this.movieRepository, filters);

      queryBuilder.skip((page - 1) * limit).take(limit);

      const [data, count] = await queryBuilder
        .orderBy('id', 'ASC')
        .getManyAndCount();

      return { data, count, page };
    } catch (error) {
      this.logger.error(`Error finding movies: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch movies');
    }
  }

  async findOneById(id: string): Promise<Movie | null> {
    const parsedId = parseId(id);

    const movie = await this.movieRepository.findOneBy({ id: parsedId });

    if (!movie)
      throw new NotFoundException(`Movie with ID ${parsedId} not found`);

    return movie;
  }

  private async findOneBy(filters: IFindMovie): Promise<Movie | null> {
    const queryBuilder = addFilters(this.movieRepository, filters);

    const movie = await queryBuilder.getOne();

    if (!movie) throw new NotFoundException(`Movie not found`);

    return movie;
  }

  async update(
    id: string,
    movie: Partial<Omit<Movie, 'id'>>,
  ): Promise<Movie | null> {
    checkEmptyObject(movie);

    const parsedId = parseId(id);

    const updatedMovie = await this.movieRepository.update(parsedId, movie);

    if (!updatedMovie.affected)
      throw new NotFoundException(`Movie with ID ${parsedId} not found`);

    return await this.movieRepository.findOneBy({
      id: parsedId,
    });
  }

  async delete(id: string): Promise<void> {
    const parsedId = parseId(id);

    const result = await this.movieRepository.delete(parsedId);

    if (!result.affected)
      throw new NotFoundException(`Movie with ID ${parsedId} not found`);
  }

  async syncWithStarWarsAPI(): Promise<void> {
    try {
      const response = await axios.get('https://swapi.dev/api/films/');
      const films = response.data.results;

      for (const film of films) {
        try {
          await this.findOneBy({
            tag: 'Star-Wars',
            episodeId: film.episode_id,
          });
        } catch {
          const movie: CreateMovieDto = {
            title: film.title,
            description: film.opening_crawl,
            episodeId: film.episode_id,
            director: film.director,
            releaseDate: film.release_date,
            isSeries: true,
            genre: 'Action',
            tags: ['Star-Wars', 'Space'],
          };

          const syncMovie = await this.create(movie);

          this.logger.log(`Synchronized movie with ID: ${syncMovie.id}`);
        }
      }
    } catch (error) {
      this.logger.error(
        `Error syncing with Star Wars API: ${error.message}`,
        error.stack,
      );

      throw new BadRequestException('Failed to sync with Star Wars API');
    }
  }
}
