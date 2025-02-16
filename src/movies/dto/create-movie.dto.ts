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
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  description: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  director: string;

  @IsDateString()
  @IsNotEmpty()
  releaseDate: string;

  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  rating?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  episodeId?: number;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  genre: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @Length(1, 20, { each: true })
  tags: string[];

  @IsBoolean()
  isSeries: boolean;
}
