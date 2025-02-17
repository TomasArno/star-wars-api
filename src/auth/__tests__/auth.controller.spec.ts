import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import {
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

const mockRegisterDto: RegisterDto = {
  fullName: 'Test user',
  email: 'test@gmail.com',
  password: 'hola123',
};

const mockLoginDto: LoginDto = {
  email: 'test@gmail.com',
  password: 'hola123',
};

const mockUser = {
  id: 1,
  email: 'test@gmail.com',
  fullName: 'Test User',
  role: 0,
};

const mockAccessToken = 'mockAccessToken';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a user', async () => {
      const expectedResult = {
        message: 'User registered successfully',
        user: mockUser,
      };
      (authService.register as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.register(mockRegisterDto);

      expect(authService.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle BadRequestException', async () => {
      (authService.register as jest.Mock).mockRejectedValue(
        new BadRequestException(),
      );

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        accessToken: mockAccessToken,
      });

      const result = await controller.login(mockLoginDto);

      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(result).toEqual({ accessToken: mockAccessToken });
    });

    it('should handle NotFoundException', async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new NotFoundException('Email not found'),
      );

      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle UnauthorizedException', async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle BadRequestException', async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new BadRequestException(),
      );

      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
