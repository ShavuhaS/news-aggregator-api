import { ComplaintStatus } from '@prisma/client';

export class ComplaintResponse {
  id: string;
  newsId: string | null;
  userId: string;
  reason: string;
  status: ComplaintStatus;
  createdAt: Date;
  updatedAt: Date;
}
