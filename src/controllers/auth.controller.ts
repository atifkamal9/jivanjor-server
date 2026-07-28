import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../middleware/errorHandler';
import { HttpCode } from '../utils/errors';

export class AuthController {
  /**
   * Register controller
   */
  static register = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.register(req.body);
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      data: { user },
    });
  });

  /**
   * Login controller
   */
  static login = catchAsync(async (req: Request, res: Response) => {
    const data = await AuthService.login(req.body);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data,
    });
  });

  /**
   * Get current user controller
   */
  static getMe = catchAsync(async (req: Request, res: Response) => {
    // req.user is guaranteed by 'protect' middleware
    const user = await AuthService.getUserById(req.user!.id);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { user },
    });
  });

  /**
   * Change password controller
   */
  static changePassword = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: 'fail',
        message: 'Unauthorized',
      });
    }
    const result = await AuthService.changePassword(userId, req.body);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: result,
    });
  });
}
