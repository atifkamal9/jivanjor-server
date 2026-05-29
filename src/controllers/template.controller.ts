import { Request, Response } from 'express';
import { TemplateService } from '../services/template.service';
import { catchAsync } from '../middleware/errorHandler';
import { HttpCode } from '../utils/errors';

export class TemplateController {
  /**
   * Get all templates
   */
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const templates = await TemplateService.getAll();
    return res.status(HttpCode.OK).json({
      status: 'success',
      results: templates.length,
      data: { templates },
    });
  });

  /**
   * Get template by ID or slug
   */
  static getOne = catchAsync(async (req: Request, res: Response) => {
    const template = await TemplateService.getByIdOrSlug(req.params.idOrSlug);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { template },
    });
  });

  /**
   * Get current active template for a Page Slug
   */
  static getActive = catchAsync(async (req: Request, res: Response) => {
    const template = await TemplateService.getActiveForPageSlug(req.params.pageSlug);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { template },
    });
  });

  /**
   * Create template
   */
  static create = catchAsync(async (req: Request, res: Response) => {
    const template = await TemplateService.create(req.body);
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      data: { template },
    });
  });

  /**
   * Update template
   */
  static update = catchAsync(async (req: Request, res: Response) => {
    const template = await TemplateService.update(req.params.id, req.body);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { template },
    });
  });

  /**
   * Delete template
   */
  static delete = catchAsync(async (req: Request, res: Response) => {
    await TemplateService.delete(req.params.id);
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Template successfully deleted',
    });
  });

  /**
   * Activate template
   */
  static activate = catchAsync(async (req: Request, res: Response) => {
    const template = await TemplateService.activate(req.params.id);
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Template successfully activated',
      data: { template },
    });
  });
}
