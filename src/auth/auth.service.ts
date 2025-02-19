import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Auth } from './entities/auth.entity';
import { UserPayload } from './interfaces/user.interface';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { UsersService } from '../users/users.service';
import { IUpdatePassword } from './interfaces/update-password.interface';
import { checkEmptyObject } from '../common/utils/check-empty.util';
import { parseId } from '../common/utils/parse-id.util';
import { WinstonLogger } from '../config/logger.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly usersService: UsersService,
    private readonly logger: WinstonLogger,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      this.logger.log(`Registrando usuario: ${registerDto.email}`);
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      const user = await this.usersService.create({
        fullName: registerDto.fullName,
        email: registerDto.email,
      });

      const auth = this.authRepository.create({
        password: hashedPassword,
        user,
      });

      await this.authRepository.save(auth);

      this.logger.log(`Usuario registrado con éxito: ${user.email}`);
      return { message: 'User registered successfully', user };
    } catch (error) {
      this.logger.error('Error al registrar usuario', error.stack);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      this.logger.log(`Intento de login para: ${loginDto.email}`);
      const user = await this.usersService.findOneByEmail(loginDto.email);

      if (!user) {
        this.logger.warn(`Email no encontrado: ${loginDto.email}`);
        throw new NotFoundException('Email not found');
      }

      const auth = await this.authRepository.findOne({
        where: { user: { id: user.id } },
      });

      if (!auth || !(await bcrypt.compare(loginDto.password, auth.password))) {
        this.logger.warn(`Credenciales inválidas para: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: UserPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      this.logger.log(`Usuario autenticado: ${loginDto.email}`);
      return {
        accessToken: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
        }),
      };
    } catch (error) {
      this.logger.error('Error en login', error.stack);
      throw error;
    }
  }

  async changePassword(userId: string | number, data: IUpdatePassword) {
    try {
      checkEmptyObject(data);
      const parsedId = parseId(userId);
      this.logger.log(`Cambio de contraseña solicitado para ID: ${parsedId}`);

      const auth = await this.authRepository
        .createQueryBuilder('auth')
        .innerJoinAndSelect('auth.user', 'user')
        .where('auth.userId = :userId', { userId: parsedId })
        .getOne();

      if (!auth) {
        this.logger.warn(`Usuario no encontrado para ID: ${parsedId}`);
        throw new NotFoundException(`User with ID ${parsedId} not found`);
      }

      if (!(await bcrypt.compare(data.oldPassword, auth.password))) {
        this.logger.warn(
          `Credenciales inválidas para cambio de contraseña en ID: ${parsedId}`,
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      await this.authRepository.update(auth.id, { password: hashedPassword });

      this.logger.log(`Contraseña actualizada para ID: ${parsedId}`);
    } catch (error) {
      this.logger.error('Error al cambiar la contraseña', error.stack);
      throw error;
    }
  }
}
