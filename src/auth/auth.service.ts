import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
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

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
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

    return { message: 'User registered successfully', user };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) throw new NotFoundException('Email not found');

    const auth = await this.authRepository.findOne({
      where: { user: { id: user.id } },
    });

    if (!auth || !(await bcrypt.compare(loginDto.password, auth.password)))
      throw new UnauthorizedException('Invalid credentials');

    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
    };
  }

  async changePassword(userId: string | number, data: IUpdatePassword) {
    checkEmptyObject(data);
    const parsedId = parseId(userId);

    const auth = await this.authRepository
      .createQueryBuilder('auth')
      .innerJoinAndSelect('auth.user', 'user')
      .where('auth.userId = :userId', { userId: parsedId })
      .getOne();

    if (!auth)
      throw new NotFoundException(`User with ID ${parsedId} not found`);

    if (!(await bcrypt.compare(data.oldPassword, auth.password)))
      throw new UnauthorizedException('Invalid credentials');

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await this.authRepository.update(auth.id, { password: hashedPassword });
  }
}
