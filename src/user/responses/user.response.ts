import { Role } from '@prisma/client';
import {
  NewsCategoryResponse,
  LocationResponse,
} from '../../news/responses/news.response';

export class UserResponse {
  id: string;
  email: string;
  username: string;
  googleId: string | null;
  role: Role;
  preferredCategories?: NewsCategoryResponse[];
  preferredLocations?: LocationResponse[];
  createdAt: Date;
  updatedAt: Date;
}
