import { Prisma } from '@prisma/client';

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    preferredCategories: { include: { category: true } };
    preferredLocations: { include: { location: true } };
  };
}>;
