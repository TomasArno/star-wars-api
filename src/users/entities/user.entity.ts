import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Auth } from '../../auth/entities/auth.entity';

export enum UserRole {
  USER = 0,
  ADMIN = 1,
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @OneToOne(() => Auth, (auth) => auth.user)
  auth: Auth;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;
}
