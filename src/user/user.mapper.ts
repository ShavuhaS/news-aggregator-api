import { Injectable } from '@nestjs/common';
import { UserResponse } from './responses/user.response';
import { UserWithRelations } from './interfaces/user-with-relations.interface';

@Injectable()
export class UserMapper {
  toResponse(user: UserWithRelations): UserResponse {
    const { password, preferredCategories, preferredLocations, ...rest } = user;

    return {
      ...rest,
      preferredCategories: preferredCategories.map((pc) => pc.category),
      preferredLocations: preferredLocations.map((pl) => pl.location),
    };
  }
}
