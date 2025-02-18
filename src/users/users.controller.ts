import {
  Controller,
  Get,
  UseGuards,
  Req,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

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
        message: 'User with ID x not found',
        timestamp: new Date().toISOString(),
      },
    },
  })
  async getProfile(@Req() req: Request) {
    const userId = req.user?.id;

    return await this.usersService.findOneById(userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update own info' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    schema: {
      example: {
        id: 1,
        fullName: 'Tomas',
        email: 'arnotomas1@gmail.com',
        role: 1,
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
  async updateProfile(
    @Req() req: Request,
    @Body()
    userDto: UpdateUserDto,
  ) {
    const userId = req.user?.id;

    return await this.usersService.update(userId, userDto);
  }

  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({
    status: 200,
    description: 'Role successfully updated',
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
  @ApiForbiddenResponse({
    description: 'Forbidden, insufficient role for this action',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden, insufficient role for this action',
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
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User ID',
    example: '1',
  })
  @ApiBody({ type: UpdateRoleDto })
  @Patch(':id/role')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async updateRole(
    @Param('id') id: string,
    @Body()
    userRoleDto: UpdateRoleDto,
  ) {
    return await this.usersService.update(id, userRoleDto);
  }
}
