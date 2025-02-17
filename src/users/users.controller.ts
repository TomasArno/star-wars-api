import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get own info' })
  @ApiResponse({
    status: 200,
    description: 'User successfully retrieved',
    schema: {
      example: {
        id: 1,
        fullName: 'Tomas',
        email: 'arnotomas1@gmail.com',
        role: 0,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized, token is required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        timestamp: new Date().toISOString(),
      },
    },
  })
  async getProfile(@Req() req: Request) {
    const userId = req.user?.id;

    await this.usersService.findOneById(userId);
  }
}
