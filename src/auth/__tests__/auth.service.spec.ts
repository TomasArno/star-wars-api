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
import { User } from 'src/users/entities/user.entity';

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

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let authRepository: Repository<Auth>;
  let jwtService: JwtService;

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
            create: jest.fn().mockReturnValue(mockAuth),
            save: jest.fn().mockResolvedValue(mockAuth),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    authRepository = module.get<Repository<Auth>>(getRepositoryToken(Auth));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a user', async () => {
      const result = await service.register(mockRegisterDto);

      expect(usersService.create).toHaveBeenCalledWith({
        fullName: mockRegisterDto.fullName,
        email: mockRegisterDto.email,
      });
      expect(authRepository.create).toHaveBeenCalledWith({
        password: expect.any(String),
        user: mockUser,
      });
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
});
