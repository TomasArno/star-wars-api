import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from '../movies.controller';
import { MoviesService } from '../movies.service';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { SearchMovieDto } from '../dto/search-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';

const mockMovie = {
  id: 1,
  title: 'Black Mirror',
  description:
    "An anthology series exploring a twisted, high-tech multiverse where humanity's greatest innovations and darkest instincts collide.",
  director: 'Charlie Brooker',
  releaseDate: '2011-12-04T00:00:00.000Z',
  genre: 'Sci-Fi',
  tags: ['technology', 'dystopia', 'psychological'],
  isSeries: true,
  rating: null,
  episodeId: null,
};

const mockCreateMovieDto: CreateMovieDto = {
  title: 'Black Mirror',
  description:
    "An anthology series exploring a twisted, high-tech multiverse where humanity's greatest innovations and darkest instincts collide.",
  director: 'Charlie Brooker',
  releaseDate: '2011-12-04T00:00:00.000Z',
  genre: 'Sci-Fi',
  tags: ['technology', 'dystopia', 'psychological'],
  isSeries: true,
};

const mockUpdateMovieDto: UpdateMovieDto = {
  title: 'test',
  description:
    "An anthology series exploring a twisted, high-tech multiverse where humanity's greatest innovations and darkest instincts collide.",
  director: 'Charlie Brooker',
  releaseDate: '2011-12-04',
  genre: 'Sci-Fi',
  tags: ['technology', 'dystopia', 'psychological'],
  isSeries: true,
};

const mockSearchMovieDto: SearchMovieDto = {};

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOneById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            syncWithStarWarsAPI: jest.fn(),
          },
        },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const request = context.switchToHttp().getRequest();
          request.user = { role: UserRole.ADMIN }; // Mock user with admin role by default
          return true;
        },
      })
      .compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMovie', () => {
    it('should create a movie', async () => {
      (service.create as jest.Mock).mockResolvedValue(mockMovie);

      const result = await controller.createMovie(mockCreateMovieDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateMovieDto);
      expect(result).toEqual(mockMovie);
    });

    it('should handle BadRequestException', async () => {
      (service.create as jest.Mock).mockRejectedValue(
        new BadRequestException('Failed to create movie'),
      );

      await expect(controller.createMovie(mockCreateMovieDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getMovies', () => {
    it('should return a list of movies', async () => {
      const mockResult = { data: [mockMovie], count: 1, page: 1 };

      (service.findAll as jest.Mock).mockResolvedValue(mockResult);

      const result = await controller.getMovies(mockSearchMovieDto, 1, 20);

      expect(service.findAll).toHaveBeenCalledWith(mockSearchMovieDto, 1, 20);
      expect(result).toEqual(mockResult);
    });

    it('should handle BadRequestException', async () => {
      (service.findAll as jest.Mock).mockRejectedValue(
        new BadRequestException('Failed to fetch movies'),
      );

      await expect(
        controller.getMovies(mockSearchMovieDto, 1, 20),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMovie', () => {
    it('should return a movie by ID', async () => {
      (service.findOneById as jest.Mock).mockResolvedValue(mockMovie);

      const result = await controller.getMovie('1');

      expect(service.findOneById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockMovie);
    });

    it('should handle NotFoundException', async () => {
      (service.findOneById as jest.Mock).mockRejectedValue(
        new NotFoundException('Movie not found'),
      );

      await expect(controller.getMovie('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMovie', () => {
    it('should update a movie', async () => {
      (service.update as jest.Mock).mockResolvedValue(mockMovie);

      const result = await controller.updateMovie('1', mockUpdateMovieDto);

      expect(service.update).toHaveBeenCalledWith('1', mockUpdateMovieDto);
      expect(result).toEqual(mockMovie);
    });

    it('should handle NotFoundException', async () => {
      (service.update as jest.Mock).mockRejectedValue(
        new NotFoundException('Movie not found'),
      );

      await expect(
        controller.updateMovie('1', mockUpdateMovieDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
