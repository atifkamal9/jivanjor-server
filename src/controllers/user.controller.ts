import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { catchAsync } from '../middleware/errorHandler';
import { HttpCode } from '../utils/errors';

export class UserController {
  static getUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await UserService.getAll(req.user);
    res.status(HttpCode.OK).json({
      status: 'success',
      data: { users },
    });
  });

  static getUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.getById(req.params.id, req.user);
    res.status(HttpCode.OK).json({
      status: 'success',
      data: { user },
    });
  });

  static createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.create(req.body);
    res.status(HttpCode.CREATED).json({
      status: 'success',
      data: { user },
    });
  });

  static updateUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.update(req.params.id, req.body, req.user);
    res.status(HttpCode.OK).json({
      status: 'success',
      data: { user },
    });
  });

  static deleteUser = catchAsync(async (req: Request, res: Response) => {
    await UserService.delete(req.params.id, req.user!.id, req.user);
    res.status(HttpCode.OK).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  });
}
