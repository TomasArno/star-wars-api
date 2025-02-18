import { IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.ADMIN,
    required: false,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
