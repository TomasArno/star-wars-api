import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { parseId } from '../common/utils/parse-id.util';
import { checkEmptyObject } from '../common/utils/check-empty.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  async create(createUserDto: CreateUserDto): Promise<User> {
    checkEmptyObject(createUserDto);

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user)
      throw new NotFoundException(`User with Email ${email} not found`);

    return user;
  }

  async findOneById(id: number): Promise<User | null> {
    const parsedId = parseId(id);

    const user = await this.userRepository.findOne({
      where: { id: parsedId },
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    return user;
  }

  async update(
    id: string | number,
    user: Partial<Omit<User, 'id' | 'auth'>>,
  ): Promise<User | null> {
    checkEmptyObject(user);
    const parsedId = parseId(id);

    const updatedUser = await this.userRepository.update(parsedId, user);
    if (!updatedUser.affected)
      throw new NotFoundException(`User with ID ${parsedId} not found`);

    return await this.userRepository.findOneBy({
      id: parsedId,
    });
  }
}
