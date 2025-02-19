import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Auth } from '../entities/auth.entity';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { User } from '../../users/entities/user.entity';
import { IUpdatePassword } from '../interfaces/update-password.interface';
import { WinstonLogger } from '../../config/logger.config';

const mockUser: Omit<User, 'auth'> = {
  id: 1,
  email: 'test@gmail.com',
  fullName: 'Test',
  role: 1,
};

const mockAuth = {
  password: 'hashedPassword',
  user: mockUser,
};

const mockRegisterDto: RegisterDto = {
  fullName: 'Test',
  email: 'test@gmail.com',
  password: 'asdasd',
};

const mockLoginDto: LoginDto = {
  email: 'test@gmail.com',
  password: '123444',
};

const mockUpdatePasswordDto: IUpdatePassword = {
  oldPassword: 'oldPassword',
  newPassword: 'newPassword',
};

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let authRepository: Repository<Auth>;
  let jwtService: JwtService;
  let logger: WinstonLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockUser),
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockAccessToken'),
          },
        },
        {
          provide: getRepositoryToken(Auth),
          useValue: {
            create: jest.fn().mockImplementation((data) => ({
              ...data,
              password: 'hashedPassword',
            })),
            save: jest.fn().mockResolvedValue(mockAuth),
            findOne: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnThis(),
            innerJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
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

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    authRepository = module.get<Repository<Auth>>(getRepositoryToken(Auth));
    jwtService = module.get<JwtService>(JwtService);
    logger = module.get<WinstonLogger>(WinstonLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a user', async () => {
      const result = await service.register(mockRegisterDto);
      (usersService.create as jest.Mock).mockResolvedValue(mockUser);

      expect(authRepository.save).toHaveBeenCalledWith(mockAuth);
      expect(result).toEqual({
        message: 'User registered successfully',
        user: mockUser,
      });
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
      (authRepository.findOne as jest.Mock).mockResolvedValue(mockAuth);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      const result = await service.login(mockLoginDto);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(
        mockLoginDto.email,
      );
      expect(authRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockAuth.password,
      );
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: 'mockAccessToken' });
    });

    it('should throw NotFoundException if user not found', async () => {
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(null);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if invalid credentials', async () => {
      (usersService.findOneByEmail as jest.Mock).mockResolvedValue(mockUser);
      (authRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      (authRepository.findOne as jest.Mock).mockResolvedValue(mockAuth);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);

      await expect(service.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      const mockAuth = {
        id: mockUser.id,
        email: mockUser.email,
        password: 'oldHashedPassword',
        userId: mockUser.id,
      };

      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockAuth),
      };

      (authRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      (authRepository.update as jest.Mock).mockResolvedValue(undefined);

      const result = await service.changePassword(
        mockUser.id,
        mockUpdatePasswordDto,
      );

      expect(authRepository.createQueryBuilder).toHaveBeenCalledWith('auth');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
        'auth.user',
        'user',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'auth.userId = :userId',
        { userId: mockUser.id },
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();

      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockUpdatePasswordDto.oldPassword,
        mockAuth.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(
        mockUpdatePasswordDto.newPassword,
        10,
      );

      expect(authRepository.update).toHaveBeenCalledWith(mockAuth.id, {
        password: 'newHashedPassword',
      });

      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      (authRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.changePassword(mockUser.id, mockUpdatePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if old password is incorrect', async () => {
      const mockAuth = {
        id: mockUser.id,
        email: mockUser.email,
        password: 'oldHashedPassword',
        userId: mockUser.id,
      };

      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockAuth),
      };

      (authRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(mockUser.id, mockUpdatePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
