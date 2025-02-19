import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';

import { User } from './users/entities/user.entity';
import { Auth } from './auth/entities/auth.entity';
import { Movie } from './movies/entities/movie.entity';

import { WinstonLogger } from './config/logger.config';

@Module({
  providers: [WinstonLogger],
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV !== 'prod'
          ? `.env.${process.env.NODE_ENV}`
          : undefined,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Auth, Movie],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    AuthModule,
    UsersModule,
    MoviesModule,
  ],
  exports: [WinstonLogger],
})
export class AppModule {}
