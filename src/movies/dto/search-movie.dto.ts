import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class SearchMovieDto {
  @IsString()
  @IsOptional()
  @Length(1, 255)
  title?: string;

  @IsString()
  @IsOptional()
  @Length(1, 1000)
  description?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  director?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d+(\.\d+)?$/, { message: 'rating debe ser un número válido' })
  rating?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d+$/, { message: 'episodeId debe ser un número válido' })
  episodeId?: string;

  @IsString()
  @IsOptional()
  @Length(2, 50)
  genre?: string;
}
