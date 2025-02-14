import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Auth } from './entities/auth.entity';
import { UserPayload } from './interfaces/user-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
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
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const auth = await this.authRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (!auth || !(await bcrypt.compare(loginDto.password, auth.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: UserPayload = {
      email: user.email,
      id: user.id,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
    };
  }
}
