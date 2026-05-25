import { Request, Response } from 'express';
import { IssueService } from '../services/issue.service';
import { catchAsync } from '../middleware/errorHandler';
import { HttpCode } from '../utils/errors';

export class IssueController {
  /**
   * Get all issues
   */
  static getAll = catchAsync(async (req: Request, res: Response) => {
    const issues = await IssueService.getAll();
    return res.status(HttpCode.OK).json({
      status: 'success',
      results: issues.length,
      data: { issues },
    });
  });

  /**
   * Get issue by ID or slug
   */
  static getOne = catchAsync(async (req: Request, res: Response) => {
    const issue = await IssueService.getByIdOrSlug(req.params.idOrSlug);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { issue },
    });
  });

  /**
   * Create issue
   */
  static create = catchAsync(async (req: Request, res: Response) => {
    const issue = await IssueService.create(req.body);
    return res.status(HttpCode.CREATED).json({
      status: 'success',
      data: { issue },
    });
  });

  /**
   * Update issue
   */
  static update = catchAsync(async (req: Request, res: Response) => {
    const issue = await IssueService.update(req.params.id, req.body);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { issue },
    });
  });

  /**
   * Delete issue
   */
  static delete = catchAsync(async (req: Request, res: Response) => {
    await IssueService.delete(req.params.id);
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Issue successfully deleted',
    });
  });
}
