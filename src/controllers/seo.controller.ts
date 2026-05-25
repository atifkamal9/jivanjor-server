import { Request, Response } from 'express';
import { SEOService } from '../services/seo.service';
import { catchAsync } from '../middleware/errorHandler';
import { HttpCode, AppError } from '../utils/errors';

export class SEOController {
  /**
   * Get SEO metadata for target
   */
  static getOne = catchAsync(async (req: Request, res: Response) => {
    const pageType = req.query.pageType as string;
    const pageId = (req.query.pageId as string) || null;

    if (!pageType) {
      throw new AppError('Query parameter pageType is required', HttpCode.BAD_REQUEST);
    }

    const seo = await SEOService.getMetadata(pageType, pageId);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { seo },
    });
  });

  /**
   * Create or update SEO metadata
   */
  static upsert = catchAsync(async (req: Request, res: Response) => {
    const seo = await SEOService.upsert(req.body);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { seo },
    });
  });

  /**
   * Delete SEO metadata
   */
  static delete = catchAsync(async (req: Request, res: Response) => {
    const pageType = req.query.pageType as string;
    const pageId = (req.query.pageId as string) || null;

    if (!pageType) {
      throw new AppError('Query parameter pageType is required for deletion', HttpCode.BAD_REQUEST);
    }

    await SEOService.delete(pageType, pageId);
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'SEO metadata successfully deleted',
    });
  });
}
