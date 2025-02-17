import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  Length,
  IsDateString,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMovieDto {
  @ApiPropertyOptional({
    description: 'The title of the movie.',
    example: 'Star Wars: The Empire Strikes Back',
  })
  @IsString()
  @IsOptional()
  @Length(1, 255)
  title?: string;

  @ApiPropertyOptional({
    description: 'The description of the movie.',
    example: 'The Rebels continue their fight against the Empire.',
  })
  @IsString()
  @IsOptional()
  @Length(1, 1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'The director of the movie.',
    example: 'Irvin Kershner',
  })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  director?: string;

  @ApiPropertyOptional({
    description: 'The release date of the movie.',
    example: '1980-05-17',
  })
  @IsDateString()
  @IsOptional()
  releaseDate?: string;

  @ApiPropertyOptional({
    description: 'The rating of the movie.',
    example: 9,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({
    description: 'The episode ID of the movie.',
    example: 5,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  episodeId?: number;

  @ApiPropertyOptional({
    description: 'The genre of the movie.',
    example: 'Action',
  })
  @IsString()
  @IsOptional()
  @Length(2, 50)
  genre?: string;

  @ApiPropertyOptional({
    description: 'The tags associated with the movie.',
    example: ['Action', 'Adventure'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @Length(1, 20, { each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Indicates if the movie is part of a series.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isSeries?: boolean;
}
