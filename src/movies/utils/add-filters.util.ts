import { Repository } from 'typeorm';
import { Movie } from '../entities/movie.entity';

export function addFilters(movieRepository: Repository<Movie>, filters) {
  const queryBuilder = movieRepository.createQueryBuilder('movie');

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

  if (filters.tag) {
    queryBuilder.andWhere('movie.tags ILIKE :tags', {
      tags: `%${filters.tag}%`,
    });
  }

  if (filters.episodeId !== undefined) {
    queryBuilder.andWhere('movie.episodeId = :episodeId', {
      episodeId: filters.episodeId,
    });
  }

  return queryBuilder;
}
