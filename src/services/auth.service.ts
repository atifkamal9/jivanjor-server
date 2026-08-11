import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { AppError, HttpCode } from '../utils/errors';
import { signToken } from '../utils/jwt';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../utils/validation';

type RegisterInput = z.infer<typeof registerSchema>['body'];
type LoginInput = z.infer<typeof loginSchema>['body'];

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput) {
    const { name, email, password, role } = input;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email already in use', HttpCode.CONFLICT);
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Login user and generate token
   */
  static async login(input: LoginInput) {
    const { email, password } = input;

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', HttpCode.UNAUTHORIZED);
    }

    // 2. Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', HttpCode.UNAUTHORIZED);
    }

    // 3. Generate token
    const token = signToken({ userId: user.id, role: user.role, permissions: user.permissions });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    };
  }

  /**
   * Get user profile by ID
   */
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', HttpCode.NOT_FOUND);
    }

    return user;
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, input: { currentPassword?: string; newPassword?: string }) {
    const { currentPassword, newPassword } = input;
    if (!newPassword || newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters long', HttpCode.BAD_REQUEST);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', HttpCode.NOT_FOUND);
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new AppError('Current password is incorrect', HttpCode.BAD_REQUEST);
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }
}
