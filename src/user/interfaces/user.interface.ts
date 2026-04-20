import { User } from '@prisma/client';

export type SafeUser = Omit<User, 'password'>;

// Used by AuthService after Google/OAuth verification
export interface InternalCreateUser {
  email: string;
  username?: string;
  googleId?: string;
  password?: string;
}

// Used for standard local registration
export interface LocalRegisterUser {
  email: string;
  password: string;
  username?: string;
}
