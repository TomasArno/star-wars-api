import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Auth } from '../../auth/entities/auth.entity';

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
}
