import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { catchAsync } from '../middleware/errorHandler';
import { HttpCode } from '../utils/errors';

export class ProductController {
  /**
   * Get all products with filters
   */
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const { products, pagination } = await ProductService.getAll(req.query);
    return res.status(HttpCode.OK).json({
      status: 'success',
      results: products.length,
      pagination,
      data: { products },
    });
  });

  /**
   * Get product by ID or Slug
   */
  static getOne = catchAsync(async (req: Request, res: Response) => {
    const product = await ProductService.getByIdOrSlug(req.params.idOrSlug);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { product },
    });
  });

  /**
   * Create product
   */
  static create = catchAsync(async (req: Request, res: Response) => {
    const product = await ProductService.create(req.body);
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      data: { product },
    });
  });

  /**
   * Update product
   */
  static update = catchAsync(async (req: Request, res: Response) => {
    const product = await ProductService.update(req.params.id, req.body);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { product },
    });
  });

  /**
   * Delete product
   */
  static delete = catchAsync(async (req: Request, res: Response) => {
    await ProductService.delete(req.params.id);
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Product successfully deleted',
    });
  });
}
