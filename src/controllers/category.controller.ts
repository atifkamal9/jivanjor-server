import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { catchAsync } from '../middleware/errorHandler';
import { HttpCode } from '../utils/errors';

export class CategoryController {
  /**
   * Get all categories (flat or tree)
   */
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const treeMode = req.query.tree === 'true';
    const categories = await CategoryService.getAll(treeMode);
    return res.status(HttpCode.OK).json({
      status: 'success',
      results: categories.length,
      data: { categories },
    });
  });

  /**
   * Get category by ID or slug
   */
  static getOne = catchAsync(async (req: Request, res: Response) => {
    const category = await CategoryService.getByIdOrSlug(req.params.idOrSlug);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { category },
    });
  });

  /**
   * Create category
   */
  static create = catchAsync(async (req: Request, res: Response) => {
    const category = await CategoryService.create(req.body);
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      data: { category },
    });
  });

  /**
   * Update category
   */
  static update = catchAsync(async (req: Request, res: Response) => {
    const category = await CategoryService.update(req.params.id, req.body);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { category },
    });
  });

  /**
   * Delete category
   */
  
  /**
   * Reorder categories batch
   */
  static reorder = catchAsync(async (req: Request, res: Response) => {
    await CategoryService.reorder(req.body.items);
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Categories reordered successfully',
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await CategoryService.delete(req.params.id);
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Category successfully deleted',
    });
  });
}
