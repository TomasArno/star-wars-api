import { IsString, IsOptional, Length, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchMovieDto {
  @ApiPropertyOptional({
    description: 'The title of the movie.',
    example: 'Star Wars',
  })
  @IsString()
  @IsOptional()
  @Length(1, 255)
  title?: string;

  @ApiPropertyOptional({
    description: 'The description of the movie.',
    example: 'A long time ago in a galaxy far, far away...',
  })
  @IsString()
  @IsOptional()
  @Length(1, 1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'The director of the movie.',
    example: 'George Lucas',
  })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  director?: string;

  @ApiPropertyOptional({
    description: 'The rating of the movie.',
    example: '8.5',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d+(\.\d+)?$/, { message: 'Rating must be a valid number' })
  rating?: string;

  @ApiPropertyOptional({
    description: 'The episode ID of the movie.',
    example: '1',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d+$/, { message: 'episodeId must be a valid number' })
  episodeId?: string;

  @ApiPropertyOptional({
    description: 'The genre of the movie.',
    example: 'Action',
  })
  @IsString()
  @IsOptional()
  @Length(2, 50)
  genre?: string;

  @ApiPropertyOptional({
    description: 'The tag of the movie.',
    example: 'Sci-Fi',
  })
  @IsString()
  @IsOptional()
  @Length(2, 20)
  tag?: string;
}
