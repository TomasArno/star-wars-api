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

export class UpdateMovieDto {
  @IsString()
  @IsOptional()
  @Length(1, 255)
  title: string;

  @IsString()
  @IsOptional()
  @Length(1, 1000)
  description: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  director: string;

  @IsDateString()
  @IsOptional()
  releaseDate: string;

  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  rating: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  episodeId: number;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  genre: string;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @Length(1, 20, { each: true })
  tags: string[];

  @IsBoolean()
  @IsOptional()
  isSeries: boolean;
}
