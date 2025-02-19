import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from '../movies.service';
import { Movie } from '../entities/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WinstonLogger } from '../../config/logger.config';

const mockMovieRepository = {
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('MoviesService', () => {
  let service: MoviesService;
  let logger: WinstonLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
        {
          provide: WinstonLogger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    logger = module.get<WinstonLogger>(WinstonLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a movie successfully', async () => {
      const movieDto = {
        title: 'Inception',
        description: 'A dream within a dream.',
        director: 'Christopher Nolan',
        releaseDate: '2010-07-16',
        rating: 9,
        genre: 'Sci-Fi',
        tags: ['mind-bending', 'thriller'],
        isSeries: false,
      };

      mockMovieRepository.create.mockReturnValue(movieDto);
      mockMovieRepository.save.mockResolvedValue(movieDto);

      const result = await service.create(movieDto);

      expect(result).toEqual(movieDto);
      expect(mockMovieRepository.create).toHaveBeenCalledWith(movieDto);
      expect(mockMovieRepository.save).toHaveBeenCalledWith(movieDto);
    });
  });

  describe('findOne by ID', () => {
    it('should return a movie by ID', async () => {
      const movie = { id: 1, title: 'The Matrix' };
      mockMovieRepository.findOneBy.mockResolvedValue(movie);

      const result = await service.findOneById('1');
      expect(result).toEqual(movie);
      expect(mockMovieRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if movie is not found', async () => {
      mockMovieRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOneById('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if ID is invalid', async () => {
      await expect(service.findOneById('abc')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a movie successfully', async () => {
      const oldMovie = {
        id: 1,
        title: 'Inception',
        description: 'A dream within a dream.',
        director: 'Christopher Nolan',
        releaseDate: '2010-07-16',
        rating: 9,
        genre: 'Sci-Fi',
        tags: ['mind-bending', 'thriller'],
        isSeries: false,
      };

      const value = { title: 'Updated Title' };

      const newMovie = {
        ...oldMovie,
        ...value,
      };

      mockMovieRepository.update.mockResolvedValue({ affected: 1 });
      mockMovieRepository.findOneBy.mockResolvedValue(newMovie);

      const result = await service.update('1', value);
      expect(result).toEqual(newMovie);
      expect(mockMovieRepository.update).toHaveBeenCalledWith(1, value);
    });

    it('should throw NotFoundException if movie is not found', async () => {
      mockMovieRepository.update.mockResolvedValue({ affected: 0 });

      await expect(
        service.update('1', { title: 'test' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if body is empty', async () => {
      await expect(service.update('1', {} as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a movie successfully', async () => {
      mockMovieRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.delete('1')).resolves.toBeUndefined();
      expect(mockMovieRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if movie is not found', async () => {
      mockMovieRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete('1')).rejects.toThrow(NotFoundException);
    });
  });
});
