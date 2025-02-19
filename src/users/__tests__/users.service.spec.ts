import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WinstonLogger } from '../../config/logger.config';

const mockUser: Omit<User, 'auth'> = {
  id: 1,
  email: 'test@example.com',
  fullName: 'Test',
  role: 1,
};

const mockCreateUserDto: CreateUserDto = {
  email: 'test@example.com',
  fullName: 'Test',
};

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let logger: WinstonLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn().mockReturnValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
            findOne: jest.fn(),
            update: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: WinstonLogger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    logger = module.get<WinstonLogger>(WinstonLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createdUser = await service.create(mockCreateUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(createdUser).toEqual(mockUser);
    });
  });

  describe('findOneByEmail', () => {
    it('should find a user by email', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const user = await service.findOneByEmail('test@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(user).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found by email', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findOneByEmail('nonexistent@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneById', () => {
    it('should find a user by id', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const user = await service.findOneById(1);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(user).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found by id', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOneById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user and return the updated user', async () => {
      const updatedUser = { ...mockUser, fullName: 'Updated Name' };
      (userRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });
      (userRepository.findOneBy as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.update(1, { fullName: 'Updated Name' });

      expect(userRepository.update).toHaveBeenCalledWith(1, {
        fullName: 'Updated Name',
      });
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      (userRepository.update as jest.Mock).mockResolvedValue({ affected: 0 });

      await expect(
        service.update(999, { fullName: 'Updated Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if update data is empty', async () => {
      await expect(service.update(1, {})).rejects.toThrow(BadRequestException);
    });
  });
});
