import { Request, Response, NextFunction } from 'express';
import { AppError, HttpCode } from '../utils/errors';
import { ZodError } from 'zod';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error(`[Error Handler] Error occurred:`, err);

  // 1. AppError (Operational errors we throw)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // 2. Zod Validation Errors
  if (err instanceof ZodError) {
    return res.status(HttpCode.BAD_REQUEST).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // 3. Prisma unique constraint violation (P2002)
  if (err.name === 'PrismaClientKnownRequestError' && (err as any).code === 'P2002') {
    const targets = (err as any).meta?.target || 'field';
    return res.status(HttpCode.CONFLICT).json({
      status: 'error',
      message: `A record with this ${targets} already exists.`,
    });
  }

  // 4. Default Internal Server Error
  const isProd = env.NODE_ENV === 'production';
  return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'An unexpected server error occurred',
    ...(isProd ? {} : { stack: err.stack, details: err.message }),
  });
};

// Helper wrapper to catch async route errors and pass to errorHandler
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
