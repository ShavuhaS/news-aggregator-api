import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { InternalCreateUser } from './interfaces/create-user.interface';
import { UpdateUserData } from './interfaces/update-user.interface';

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

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
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

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
