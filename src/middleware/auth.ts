import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError, HttpCode } from '../utils/errors';
import { prisma } from '../config/db';
import { catchAsync } from './errorHandler';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
        permissions?: string[];
      };
    }
  }
}

/**
 * Protect routes - Authenticate JWT token
 */
export const protect = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Extract token from Bearer header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', HttpCode.UNAUTHORIZED));
  }

  try {
    // 2. Verify token
    const decoded = verifyToken(token);

    // 3. Check if user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, name: true, permissions: true },
    });

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', HttpCode.UNAUTHORIZED));
    }

    // 4. Attach user to request
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token. Please log in again.', HttpCode.UNAUTHORIZED));
  }
});

/**
 * Restrict routes to specific user roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', HttpCode.FORBIDDEN));
    }
    next();
  };
};

/**
 * Restrict routes to specific permissions or SUPER_ADMIN
 */
export const restrictToPermission = (...permissionKeys: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('You do not have permission to perform this action.', HttpCode.FORBIDDEN));
    }
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }
    const userPermissions = req.user.permissions || [];
    const hasAny = permissionKeys.some((key) => userPermissions.includes(key));
    if (!hasAny) {
      return next(new AppError('You do not have permission to access this resource.', HttpCode.FORBIDDEN));
    }
    next();
  };
};
