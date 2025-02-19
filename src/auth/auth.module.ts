import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Auth } from './entities/auth.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { WinstonLogger } from '../config/logger.config';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, WinstonLogger],
  imports: [
    TypeOrmModule.forFeature([Auth]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
  ],
})
export class AuthModule {}
