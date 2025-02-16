import { UserRole } from 'src/users/entities/user.entity';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface UserPayload extends Pick<User, 'id' | 'email' | 'role'> {}
