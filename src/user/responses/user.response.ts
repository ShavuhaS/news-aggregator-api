import { Role } from '@prisma/client';

export class UserResponse {
  id: string;
  email: string;
  username: string;
  googleId: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
