import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { InternalCreateUser } from './interfaces/create-user.interface';
import { UpdateUserData } from './interfaces/update-user.interface';
import { UserWithRelations } from './interfaces/user-with-relations.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ListUserComplaintsQueryDto } from './dto/list-user-complaints-query.dto';
import { PaginatedResponse } from '../common/responses/paginated.response';
import { ComplaintResponse } from '../news/responses/complaint.response';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });
  }

  async findById(id: string): Promise<UserWithRelations | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        preferredCategories: { include: { category: true } },
        preferredLocations: { include: { location: true } },
      },
    });
  }

  async create(data: InternalCreateUser): Promise<User> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.username ? [{ username: data.username }] : []),
        ],
      },
    });

    if (existingUser) {
      const field = existingUser.email === data.email ? 'email' : 'username';
      throw new ConflictException(`User with this ${field} already exists`);
    }

    const hashedPassword = data.password
      ? await bcrypt.hash(data.password, 10)
      : null;

    const username = data.username || data.email.split('@')[0];

    return this.prisma.user.create({
      data: {
        email: data.email,
        username,
        password: hashedPassword,
        googleId: data.googleId,
        role: Role.USER,
      },
    });
  }

  async update(id: string, data: UpdateUserData): Promise<UserWithRelations> {
    if (data.email || data.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(data.email ? [{ email: data.email }] : []),
            ...(data.username ? [{ username: data.username }] : []),
          ],
          NOT: { id },
        },
      });

      if (existingUser) {
        const field = existingUser.email === data.email ? 'email' : 'username';
        throw new ConflictException(`User with this ${field} already exists`);
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        preferredCategories: { include: { category: true } },
        preferredLocations: { include: { location: true } },
      },
    });
  }

  async changePassword(id: string, data: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.password) {
      throw new BadRequestException(
        'User does not have a password set (OAuth account)',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      data.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async addCategory(userId: string, categoryId: string) {
    const category = await this.prisma.newsCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException('Category does not exist');
    }

    return this.prisma.userPreferredCategory.upsert({
      where: { userId_categoryId: { userId, categoryId } },
      create: { userId, categoryId },
      update: {},
    });
  }

  async removeCategory(userId: string, categoryId: string) {
    return this.prisma.userPreferredCategory
      .delete({
        where: { userId_categoryId: { userId, categoryId } },
      })
      .catch(() => {
        throw new NotFoundException('Category preference not found');
      });
  }

  async addLocation(userId: string, locationId: string) {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!location) {
      throw new BadRequestException('Location does not exist');
    }

    return this.prisma.userPreferredLocation.upsert({
      where: { userId_locationId: { userId, locationId } },
      create: { userId, locationId },
      update: {},
    });
  }

  async removeLocation(userId: string, locationId: string) {
    return this.prisma.userPreferredLocation
      .delete({
        where: { userId_locationId: { userId, locationId } },
      })
      .catch(() => {
        throw new NotFoundException('Location preference not found');
      });
  }

  async getUserComplaints(
    userId: string,
    query: ListUserComplaintsQueryDto,
  ): Promise<PaginatedResponse<ComplaintResponse>> {
    const { page = 1, pageSize = 20 } = query;

    const [data, totalCount] = await Promise.all([
      this.prisma.complaint.findMany({
        where: { userId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.complaint.count({ where: { userId } }),
    ]);

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      pageSize,
    };
  }
}
