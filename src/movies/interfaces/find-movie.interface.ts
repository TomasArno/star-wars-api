import { UpdateMovieDto } from '../dto/update-movie.dto';

export interface IFindMovie extends Omit<UpdateMovieDto, 'tags'> {
  tag?: string;
}
