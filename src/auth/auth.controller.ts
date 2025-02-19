import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { WinstonLogger } from '../config/logger.config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: WinstonLogger,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User registered successfully' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            fullName: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'johndoe@example.com' },
            role: { type: 'string', example: 'user' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: [],
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user and return JWT token' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in and JWT token returned.',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'jwtToken' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Email not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Email not found',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: [],
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiBody({ type: LoginDto })
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({
    status: 200,
    description: 'Password successfully updated',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID x not found',
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
    schema: {
      example: {
        statusCode: 400,
        message: [],
        timestamp: new Date().toISOString(),
      },
    },
  })
  @ApiBody({ type: UpdatePasswordDto })
  @Patch('password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Req() req: Request,
    @Body()
    userRoleDto: UpdatePasswordDto,
  ) {
    const userId = req.user?.id;

    return await this.authService.changePassword(userId, userRoleDto);
  }
}
