import { Request, Response } from 'express';
import { PageService } from '../services/page.service';
import { catchAsync } from '../middleware/errorHandler';
import { HttpCode } from '../utils/errors';

export class PageController {
  /**
   * Get all pages
   */
  static getAll = catchAsync(async (_req: Request, res: Response) => {
    const pages = await PageService.getAll();
    return res.status(HttpCode.OK).json({
      status: 'success',
      results: pages.length,
      data: { pages },
    });
  });

  /**
   * Get page by ID or Slug
   */
  static getOne = catchAsync(async (req: Request, res: Response) => {
    const page = await PageService.getByIdOrSlug(req.params.idOrSlug);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { page },
    });
  });

  /**
   * Create dynamic page
   */
  static create = catchAsync(async (req: Request, res: Response) => {
    const page = await PageService.create(req.body);
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      data: { page },
    });
  });

  /**
   * Update dynamic page
   */
  static update = catchAsync(async (req: Request, res: Response) => {
    const page = await PageService.update(req.params.id, req.body);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { page },
    });
  });

  /**
   * Delete dynamic page
   */
  static delete = catchAsync(async (req: Request, res: Response) => {
    await PageService.delete(req.params.id);
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Page successfully deleted',
    });
  });
}
