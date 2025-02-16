import { UserPayload } from '../../auth/interfaces/user.interface';

declare module 'express' {
  interface Request {
    user: UserPayload;
  }
}
