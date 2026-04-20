import { Role } from '@prisma/client';

export interface UpdateUserData {
  email?: string;
  username?: string;
  password?: string;
  googleId?: string;
  role?: Role;
}
