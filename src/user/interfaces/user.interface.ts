import { User } from '@prisma/client';

export type SafeUser = Omit<User, 'password'>;

export interface InternalCreateUser {
  email: string;
  username?: string;
  googleId?: string;
  password?: string;
}

export interface LocalRegisterUser {
  email: string;
  password: string;
  username?: string;
}
