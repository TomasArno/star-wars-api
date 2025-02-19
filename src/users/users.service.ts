import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { parseId } from '../common/utils/parse-id.util';
import { checkEmptyObject } from '../common/utils/check-empty.util';
import { WinstonLogger as Logger } from '../config/logger.config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: Logger,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      checkEmptyObject(createUserDto);

      const user = this.userRepository.create(createUserDto);

      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw new BadRequestException('Error creating user');
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        this.logger.warn(`User with email ${email} not found`);
        throw new NotFoundException(`User with Email ${email} not found`);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Error finding user by email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOneById(id: number): Promise<User | null> {
    try {
      const parsedId = parseId(id);
      const user = await this.userRepository.findOne({
        where: { id: parsedId },
      });

      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Error finding user by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: string | number,
    user: Partial<Omit<User, 'id' | 'auth'>>,
  ): Promise<User | null> {
    try {
      checkEmptyObject(user);
      const parsedId = parseId(id);

      const updatedUser = await this.userRepository.update(parsedId, user);

      if (!updatedUser.affected) {
        this.logger.warn(`User with ID ${parsedId} not found for update`);
        throw new NotFoundException(`User with ID ${parsedId} not found`);
      }

      return await this.userRepository.findOneBy({ id: parsedId });
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
