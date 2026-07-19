import { Request, Response } from 'express';
import { SEOService } from '../services/seo.service';
import { catchAsync } from '../middleware/errorHandler';
import { HttpCode, AppError } from '../utils/errors';
import { prisma } from '../config/db';

export class SEOController {
  /**
   * Get SEO metadata for target
   */
  static getOne = catchAsync(async (req: Request, res: Response) => {
    const pageType = req.query.pageType as string;
    const pageId = (req.query.pageId as string) || null;

    if (!pageType) {
      const seoList = await prisma.sEOMetadata.findMany();
      return res.status(HttpCode.OK).json({
        status: 'success',
        results: seoList.length,
        data: { seoList },
      });
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

  /**
   * Delete SEO metadata by unique ID
   */
  static deleteById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const seo = await prisma.sEOMetadata.findUnique({
      where: { id },
    });

    if (!seo) {
      throw new AppError('SEO metadata not found', HttpCode.NOT_FOUND);
    }

    await prisma.sEOMetadata.delete({
      where: { id },
    });

    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'SEO metadata successfully deleted by ID',
    });
  });
}
