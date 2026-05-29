import { Request, Response } from 'express';
import { MaterialService } from '../services/material.service';
import { catchAsync } from '../middleware/errorHandler';
import { HttpCode } from '../utils/errors';

export class MaterialController {
  /**
   * Get all materials
   */
  static getAll = catchAsync(async (_req: Request, res: Response) => {
    const materials = await MaterialService.getAll();
    return res.status(HttpCode.OK).json({
      status: 'success',
      results: materials.length,
      data: { materials },
    });
  });

  /**
   * Get material by ID
   */
  static getOne = catchAsync(async (req: Request, res: Response) => {
    const material = await MaterialService.getById(req.params.id);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { material },
    });
  });

  /**
   * Create material
   */
  static create = catchAsync(async (req: Request, res: Response) => {
    const material = await MaterialService.create(req.body);
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      data: { material },
    });
  });

  /**
   * Update material
   */
  static update = catchAsync(async (req: Request, res: Response) => {
    const material = await MaterialService.update(req.params.id, req.body);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { material },
    });
  });

  /**
   * Delete material
   */
  static delete = catchAsync(async (req: Request, res: Response) => {
    await MaterialService.delete(req.params.id);
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Material successfully deleted',
    });
  });
}
