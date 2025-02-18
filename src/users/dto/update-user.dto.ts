import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Carlitos',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  fullName: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'carlitos@test.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email: string;
}
