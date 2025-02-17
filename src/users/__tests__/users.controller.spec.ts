import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const mockUser: Omit<User, 'auth'> = {
  id: 1,
  fullName: 'Tomas',
  email: 'arnotomas1@gmail.com',
  role: 0,
};

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const request = context.switchToHttp().getRequest();

          request.user = mockUser;

          return true;
        },
      })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      (usersService.findOneById as jest.Mock).mockResolvedValue(mockUser);
      const request = {
        user: mockUser,
      } as any;

      await controller.getProfile(request);

      expect(usersService.findOneById).toHaveBeenCalledWith(1);
    });

    it('should handle NotFoundException', async () => {
      (usersService.findOneById as jest.Mock).mockRejectedValue(
        new NotFoundException('User not found'),
      );
      const request = {
        user: { id: 999 },
      } as any;

      await expect(controller.getProfile(request)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow access if no roles are required', async () => {
      jest.spyOn(reflector, 'get').mockReturnValue(undefined);

      const request = { user: mockUser } as any;
      await expect(controller.getProfile(request)).resolves.not.toThrow();
    });
  });
});
