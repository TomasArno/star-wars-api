import { Injectable, NotFoundException } from '@nestjs/common';
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
import { WinstonLogger } from '../config/logger.config';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly logger: WinstonLogger,
  ) {}

  async create(movieDto: CreateMovieDto): Promise<Movie | undefined> {
    try {
      checkEmptyObject(movieDto);

      const movie = this.movieRepository.create(movieDto);
      const newMovie = await this.movieRepository.save(movie);
      this.logger.log(`Pelicula creada: ${JSON.stringify(movieDto)}`);

      return newMovie;
    } catch (error) {
      this.logger.error(
        `Error creando una pelicula: ${error.message}`,
        error.stack,
      );
      throw error;
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
      this.logger.error(
        `Error buscando peliculas: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOneById(id: string): Promise<Movie | null | undefined> {
    try {
      const parsedId = parseId(id);
      const movie = await this.movieRepository.findOneBy({ id: parsedId });

      if (!movie)
        throw new NotFoundException(
          `Pelicula con ID ${parsedId} no encontrada`,
        );

      return movie;
    } catch (error) {
      this.logger.error(
        `Error buscando la pelicula: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async findOneBy(
    filters: IFindMovie,
  ): Promise<Movie | null | undefined> {
    try {
      const queryBuilder = addFilters(this.movieRepository, filters);
      const movie = await queryBuilder.getOne();

      if (!movie) throw new NotFoundException(`Movie not found`);

      return movie;
    } catch (error) {
      this.logger.error(
        `Error buscando la pelicula: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: string,
    movie: Partial<Omit<Movie, 'id'>>,
  ): Promise<Movie | null | undefined> {
    try {
      checkEmptyObject(movie);
      const parsedId = parseId(id);

      const updatedMovie = await this.movieRepository.update(parsedId, movie);

      if (!updatedMovie.affected)
        throw new NotFoundException(
          `Película con ID ${parsedId} no encontrada`,
        );

      return await this.movieRepository.findOneBy({ id: parsedId });
    } catch (error) {
      this.logger.error(
        `Error actualizando la pelicula: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const parsedId = parseId(id);
      const result = await this.movieRepository.delete(parsedId);

      if (!result.affected)
        throw new NotFoundException(`Movie with ID ${parsedId} not found`);

      this.logger.log(`Pelicula con ID eliminada: ${parsedId}`);
    } catch (error) {
      this.logger.error(
        `Error eliminando la pelicula: ${error.message}`,
        error.stack,
      );
      throw error;
    }
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
          this.logger.log(`Película con ID: ${syncMovie?.id} sincronizada`);
        }
      }
    } catch (error) {
      this.logger.error(
        `Error sincronizando con la API de Star Wars: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
