import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Movie } from './entities/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { SearchMovieDto } from './dto/search-movie.dto';
import axios from 'axios';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  private readonly logger = new Logger(MoviesService.name);

  async create(movieDto: CreateMovieDto): Promise<Movie> {
    try {
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
      const queryBuilder = this.movieRepository.createQueryBuilder('movie');

      if (filters.title) {
        queryBuilder.andWhere('movie.title ILIKE :title', {
          title: `%${filters.title}%`,
        });
      }

      if (filters.description) {
        queryBuilder.andWhere('movie.description ILIKE :description', {
          description: `%${filters.description}%`,
        });
      }

      if (filters.director) {
        queryBuilder.andWhere('movie.director ILIKE :director', {
          director: `%${filters.director}%`,
        });
      }

      if (filters.rating !== undefined) {
        queryBuilder.andWhere('movie.rating = :rating', {
          rating: filters.rating,
        });
      }

      if (filters.genre) {
        queryBuilder.andWhere('movie.genre ILIKE :genre', {
          genre: `%${filters.genre}%`,
        });
      }

      if (filters.episodeId !== undefined) {
        queryBuilder.andWhere('movie.episodeId = :episodeId', {
          episodeId: filters.episodeId,
        });
      }

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
    if (isNaN(Number(id))) throw new BadRequestException('Invalid ID');
    const parsedId = parseInt(id);

    const movie = await this.movieRepository.findOneBy({ id: parsedId });

    if (!movie)
      throw new NotFoundException(`Movie with ID ${parsedId} not found`);

    return movie;
  }

  async update(id: string, movie: Omit<Movie, 'id'>): Promise<Movie | null> {
    if (isNaN(Number(id))) throw new BadRequestException('Invalid ID');
    const parsedId = parseInt(id);

    const updatedMovie = await this.movieRepository.update(parsedId, movie);

    if (!updatedMovie.affected)
      throw new NotFoundException(`Movie with ID ${parsedId} not found`);

    return await this.movieRepository.findOneBy({
      id: parsedId,
    });
  }

  async delete(id: string): Promise<void> {
    if (isNaN(Number(id))) throw new BadRequestException('Invalid ID');
    const parsedId = parseInt(id);

    const result = await this.movieRepository.delete(parsedId);

    if (!result.affected)
      throw new NotFoundException(`Movie with ID ${parsedId} not found`);
  }

  async syncWithStarWarsAPI(): Promise<void> {
    try {
      const response = await axios.get('https://swapi.dev/api/films/');
      const films = response.data.results;

      for (const film of films) {
        const movie = new Movie();

        movie.title = film.title;
        movie.description = film.opening_crawl;
        movie.episodeId = film.episode_id;
        movie.director = film.director;
        movie.releaseDate = film.release_date;
        movie.isSeries = true;
        movie.genre = 'Action';
        movie.tags = ['Star Wars', 'Space'];

        await this.movieRepository.save(movie);
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
