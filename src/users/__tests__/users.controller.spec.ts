import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { UserRole } from '../entities/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { WinstonLogger } from '../../config/logger.config';

const mockUser = {
  id: 1,
  fullName: 'Tomas',
  email: 'arnotomas1@gmail.com',
  role: UserRole.USER,
};

const mockUpdatedUser = {
  id: 1,
  fullName: 'Updated Tomas',
  email: 'updatedarnotomas1@gmail.com',
  role: UserRole.ADMIN,
};

const mockUpdateUserDto: UpdateUserDto = {
  fullName: 'Updated Tomas',
  email: 'updatedarnotomas1@gmail.com',
};

const mockUpdateRoleDto: UpdateRoleDto = {
  role: UserRole.ADMIN,
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let logger: WinstonLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: (context) => {
              const request = context.switchToHttp().getRequest();
              request.user = mockUser;
              return true;
            },
          },
        },
        Reflector,
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

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    logger = module.get<WinstonLogger>(WinstonLogger);
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(mockUser as any);

      const result = await controller.getProfile({ user: mockUser } as any);

      expect(result).toEqual(mockUser);
      expect(service.findOneById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(
        controller.getProfile({ user: { id: 999 } } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockUpdatedUser as any);

      const result = await controller.updateProfile(
        { user: mockUser } as any,
        mockUpdateUserDto,
      );

      expect(result).toEqual(mockUpdatedUser);
      expect(service.update).toHaveBeenCalledWith(1, mockUpdateUserDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest
        .spyOn(service['userRepository'], 'update')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(
        controller.updateProfile(
          { user: { id: 999 } } as any,
          mockUpdateUserDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if there is an issue with the update', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new BadRequestException('Failed to update user'));

      await expect(
        controller.updateProfile({ user: mockUser } as any, mockUpdateUserDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateRole', () => {
    it('should update user role successfully for an admin', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockUpdatedUser as any);

      const result = await controller.updateRole('1', mockUpdateRoleDto);

      expect(result).toEqual(mockUpdatedUser);
      expect(service.update).toHaveBeenCalledWith('1', mockUpdateRoleDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest
        .spyOn(service['userRepository'], 'update')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(
        controller.updateRole('999', mockUpdateRoleDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid role data is provided', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new BadRequestException('Invalid role data'));

      await expect(
        controller.updateRole('1', mockUpdateRoleDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
