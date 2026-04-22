import { Injectable } from '@nestjs/common';
import { Complaint } from '@prisma/client';
import { UserResponse } from './responses/user.response';
import { UserWithRelations } from './interfaces/user-with-relations.interface';
import { ComplaintResponse } from '../news/responses/complaint.response';
import { PaginatedResponse } from '../common/responses/paginated.response';

@Injectable()
export class UserMapper {
  toResponse(user: UserWithRelations): UserResponse {
    const { password, preferredCategories, preferredLocations, ...rest } = user;

    const response = new UserResponse();
    Object.assign(response, rest);
    response.preferredCategories = preferredCategories.map((pc) => pc.category);
    response.preferredLocations = preferredLocations.map((pl) => pl.location);

    return response;
  }

  toComplaintResponse(complaint: Complaint): ComplaintResponse {
    const response = new ComplaintResponse();
    response.id = complaint.id;
    response.newsId = complaint.newsId;
    response.userId = complaint.userId;
    response.reason = complaint.reason;
    response.status = complaint.status;
    response.createdAt = complaint.createdAt;
    response.updatedAt = complaint.updatedAt;
    return response;
  }

  toPaginatedComplaintResponse(
    paginated: PaginatedResponse<Complaint>,
  ): PaginatedResponse<ComplaintResponse> {
    const response = new PaginatedResponse<ComplaintResponse>();
    response.data = paginated.data.map((item) =>
      this.toComplaintResponse(item),
    );
    response.totalCount = paginated.totalCount;
    response.totalPages = paginated.totalPages;
    response.page = paginated.page;
    response.pageSize = paginated.pageSize;
    return response;
  }
}
