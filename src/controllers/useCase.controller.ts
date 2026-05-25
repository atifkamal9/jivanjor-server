import { Request, Response } from 'express';
import { UseCaseService } from '../services/useCase.service';
import { catchAsync } from '../middleware/errorHandler';
import { HttpCode } from '../utils/errors';

export class UseCaseController {
  /**
   * Get all use cases
   */
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const useCases = await UseCaseService.getAll();
    return res.status(HttpCode.OK).json({
      status: 'success',
      results: useCases.length,
      data: { useCases },
    });
  });

  /**
   * Get use case by ID or slug
   */
  static getOne = catchAsync(async (req: Request, res: Response) => {
    const useCase = await UseCaseService.getByIdOrSlug(req.params.idOrSlug);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { useCase },
    });
  });

  /**
   * Create use case
   */
  static create = catchAsync(async (req: Request, res: Response) => {
    const useCase = await UseCaseService.create(req.body);
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      data: { useCase },
    });
  });

  /**
   * Update use case
   */
  static update = catchAsync(async (req: Request, res: Response) => {
    const useCase = await UseCaseService.update(req.params.id, req.body);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { useCase },
    });
  });

  /**
   * Delete use case
   */
  static delete = catchAsync(async (req: Request, res: Response) => {
    await UseCaseService.delete(req.params.id);
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Use case successfully deleted',
    });
  });
}
