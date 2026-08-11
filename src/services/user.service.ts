import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { AppError, HttpCode } from '../utils/errors';
import { z } from 'zod';
import { createUserSchema, updateUserSchema } from '../utils/validation';

type CreateUserInput = z.infer<typeof createUserSchema>['body'];
type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];

export class UserService {
  /**
   * Get all users (excluding sensitive password hashes)
   * Super Admins can only see themselves; regular admins cannot see Super Admins.
   */
  static async getAll(currentUser?: { id: string; role: string; email: string }) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!currentUser) return users;

    return users.filter((u) => {
      if (u.role === 'SUPER_ADMIN') {
        return currentUser.role === 'SUPER_ADMIN' && (u.id === currentUser.id || u.email === currentUser.email);
      }
      return true;
    });
  }

  /**
   * Get user by ID
   */
  static async getById(id: string, currentUser?: { id: string; role: string; email: string }) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', HttpCode.NOT_FOUND);
    }

    if (user.role === 'SUPER_ADMIN' && currentUser) {
      if (currentUser.role !== 'SUPER_ADMIN' || (user.id !== currentUser.id && user.email !== currentUser.email)) {
        throw new AppError('User not found', HttpCode.NOT_FOUND);
      }
    }

    return user;
  }

  /**
   * Create a new user account with role and permissions
   */
  static async create(input: CreateUserInput) {
    const { name, email, password, role = 'USER', permissions = [] } = input;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email is already registered by another account', HttpCode.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    return prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as any,
        permissions,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        createdAt: true,
      },
    });
  }

  /**
   * Update user details, role, permissions, or password
   */
  static async update(id: string, input: UpdateUserInput, currentUser?: { id: string; role: string; email: string }) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('User not found', HttpCode.NOT_FOUND);
    }

    if (user.role === 'SUPER_ADMIN' && currentUser) {
      if (currentUser.role !== 'SUPER_ADMIN' || (user.id !== currentUser.id && user.email !== currentUser.email)) {
        throw new AppError('Permission denied to modify Super Admin account', HttpCode.FORBIDDEN);
      }
    }

    const dataToUpdate: any = {};

    if (input.name) dataToUpdate.name = input.name;

    if (input.email && input.email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new AppError('Email already in use by another user', HttpCode.CONFLICT);
      }
      dataToUpdate.email = input.email;
    }

    if (input.password && input.password.trim() !== '') {
      dataToUpdate.password = await bcrypt.hash(input.password, 12);
    }

    if (input.role) {
      dataToUpdate.role = input.role;
    }

    if (input.permissions !== undefined) {
      dataToUpdate.permissions = input.permissions;
    }

    return prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Delete a user account with safety checks
   */
  static async delete(id: string, currentUserId: string, currentUser?: { id: string; role: string; email: string }) {
    if (id === currentUserId) {
      throw new AppError('You cannot delete your own active session account', HttpCode.BAD_REQUEST);
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('User not found', HttpCode.NOT_FOUND);
    }

    if (user.role === 'SUPER_ADMIN') {
      if (!currentUser || currentUser.role !== 'SUPER_ADMIN' || (user.id !== currentUser.id && user.email !== currentUser.email)) {
        throw new AppError('Permission denied to delete Super Admin account', HttpCode.FORBIDDEN);
      }

      const superAdminCount = await prisma.user.count({
        where: { role: 'SUPER_ADMIN' },
      });
      if (superAdminCount <= 1) {
        throw new AppError('Cannot delete the last remaining Super Admin account', HttpCode.BAD_REQUEST);
      }
    }

    return prisma.user.delete({
      where: { id },
    });
  }
}
