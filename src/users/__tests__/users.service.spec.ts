import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

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
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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
});
