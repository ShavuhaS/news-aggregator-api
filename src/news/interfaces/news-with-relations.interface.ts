import { Prisma } from '@prisma/client';

export type NewsWithRelations = Prisma.NewsGetPayload<{
  include: {
    category: true;
    locations: { include: { location: true } };
  };
}>;

export type NewsWithComplaintsCount = Prisma.NewsGetPayload<{
  include: {
    category: true;
    _count: {
      select: {
        complaints: {
          where: { status: 'PENDING' };
        };
      };
    };
  };
}>;
