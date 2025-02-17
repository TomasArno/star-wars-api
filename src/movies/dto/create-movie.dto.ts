import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
  Length,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  IsBoolean,
} from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ description: 'The title of the movie', example: 'Star Wars' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @ApiProperty({
    description: 'The description of the movie',
    example: 'A long time ago in a galaxy far far away...',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  description: string;

  @ApiProperty({
    description: 'The director of the movie',
    example: 'George Lucas',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  director: string;

  @ApiProperty({
    description: 'The release date of the movie',
    example: '1977-05-25',
  })
  @IsDateString()
  @IsNotEmpty()
  releaseDate: string;

  @ApiProperty({
    description: 'Rating of the movie (0-10)',
    example: 9,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  rating?: number;

  @ApiProperty({
    description: 'The episode ID of the movie',
    example: 1,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  episodeId?: number;

  @ApiProperty({ description: 'The genre of the movie', example: 'Action' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  genre: string;

  @ApiProperty({
    description: 'Tags associated with the movie',
    example: ['Star-Wars', 'Sci-Fi'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @Length(1, 20, { each: true })
  tags: string[];

  @ApiProperty({
    description: 'Whether the movie is a series or not',
    example: true,
  })
  @IsBoolean()
  isSeries: boolean;
}
