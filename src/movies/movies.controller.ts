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
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { SearchMovieDto } from './dto/search-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new movie' })
  @ApiResponse({
    status: 201,
    description: 'Movie successfully created',
    schema: {
      example: {
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
        id: 1,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 400,
        message: 'Failed to create movie',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized, token is required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden, only admins can perform this action',
    schema: {
      example: {
        statusCode: 403,
        message: 'You do not have permission to access this resource',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiBody({ type: CreateMovieDto })
  async createMovie(
    @Body(
      new ValidationPipe({
        whitelist: true,
      }),
    )
    movieDto: CreateMovieDto,
  ) {
    return await this.moviesService.create(movieDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get a list of movies with optional filters and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Movies successfully retrieved',
    schema: {
      example: {
        data: [],
        count: 0,
        page: 1,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 400,
        message: 'Failed to fetch movies',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination. Default is 1.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of movies per page. Default is 20.',
    example: 20,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized, token is required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        timestamp: new Date().toISOString(),
      },
    },
  })
  async getMovies(
    @Query(ValidationPipe) filters: SearchMovieDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return await this.moviesService.findAll(filters, page, limit);
  }

  @Get(':id')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Get a movie by ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie successfully retrieved',
    schema: {
      example: {
        id: 1,
        title: 'Black Mirror',
        description:
          "An anthology series exploring a twisted, high-tech multiverse where humanity's greatest innovations and darkest instincts collide.",
        director: 'Charlie Brooker',
        releaseDate: '2011-12-04',
        rating: null,
        genre: 'Sci-Fi',
        tags: ['technology', 'dystopia', 'psychological'],
        episodeId: null,
        isSeries: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid ID',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Movie not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Movie with ID X not found',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Movie ID',
    example: '1',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized, token is required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden, insufficient role for this action',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden, insufficient role for this action',
        timestamp: new Date().toISOString(),
      },
    },
  })
  async getMovie(@Param('id') id: string) {
    if (!id) throw new BadRequestException('ID is required');

    return await this.moviesService.findOneById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a movie by ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie successfully updated',
    schema: {
      example: {
        id: 1,
        title: 'test',
        description:
          "An anthology series exploring a twisted, high-tech multiverse where humanity's greatest innovations and darkest instincts collide.",
        director: 'Charlie Brooker',
        releaseDate: '2011-12-04',
        rating: null,
        genre: 'Sci-Fi',
        tags: ['technology', 'dystopia', 'psychological'],
        episodeId: null,
        isSeries: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid ID',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Movie not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Movie with ID X not found',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Movie ID',
    example: '1',
  })
  @ApiBody({ type: UpdateMovieDto })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized, token is required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden, only admins can perform this action',
    schema: {
      example: {
        statusCode: 403,
        message: 'You do not have permission to access this resource',
        timestamp: new Date().toISOString(),
      },
    },
  })
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
    return await this.moviesService.update(id, movie);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a movie by ID' })
  @ApiResponse({
    status: 200,
    description: 'Movie successfully deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID format',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid ID',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Movie not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Movie with ID X not found',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Movie ID',
    example: '1',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized, token is required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden, only admins can perform this action',
    schema: {
      example: {
        statusCode: 403,
        message: 'You do not have permission to access this resource',
        timestamp: new Date().toISOString(),
      },
    },
  })
  async deleteMovie(@Param('id') id: string): Promise<void> {
    if (!id) throw new BadRequestException('ID is required');

    return await this.moviesService.delete(id);
  }

  @Post('sync')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Sync movies with the Star Wars API' })
  @ApiResponse({
    status: 200,
    description: 'Movies successfully synchronized',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: {
      example: {
        statusCode: 400,
        message: 'Error syncing with Star Wars API',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized, token is required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden, only admins can perform this action',
    schema: {
      example: {
        statusCode: 403,
        message: 'You do not have permission to access this resource',
        timestamp: new Date().toISOString(),
      },
    },
  })
  async syncMovies(): Promise<void> {
    return await this.moviesService.syncWithStarWarsAPI();
  }
}
