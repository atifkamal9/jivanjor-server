import { Request, Response } from 'express';
import { BlogService } from '../services/blog.service';
import { catchAsync } from '../middleware/errorHandler';
import { HttpCode } from '../utils/errors';

export class BlogController {
  /**
   * Get all blog posts with filters
   */
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const { blogs, pagination } = await BlogService.getAll(req.query);
    return res.status(HttpCode.OK).json({
      status: 'success',
      results: blogs.length,
      pagination,
      data: { blogs },
    });
  });

  /**
   * Get blog post by ID or slug
   */
  static getOne = catchAsync(async (req: Request, res: Response) => {
    const blog = await BlogService.getByIdOrSlug(req.params.idOrSlug);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { blog },
    });
  });

  /**
   * Create blog post
   */
  static create = catchAsync(async (req: Request, res: Response) => {
    const blog = await BlogService.create(req.body);
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      data: { blog },
    });
  });

  /**
   * Update blog post
   */
  static update = catchAsync(async (req: Request, res: Response) => {
    const blog = await BlogService.update(req.params.id, req.body);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { blog },
    });
  });

  /**
   * Delete blog post
   */
  static delete = catchAsync(async (req: Request, res: Response) => {
    await BlogService.delete(req.params.id);
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Blog post successfully deleted',
    });
  });
}
