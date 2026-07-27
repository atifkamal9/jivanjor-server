import { Request, Response } from 'express';
import { MenuService } from '../services/menu.service';
import { catchAsync } from '../middleware/errorHandler';
import { HttpCode } from '../utils/errors';

export class MenuController {
  // ── HEADER MENU HANDLERS ──────────────────────────────────────────────────
  /**
   * Get Header Menu (Draft & Published)
   */
  static getHeaderMenu = catchAsync(async (_req: Request, res: Response) => {
    const menu = await MenuService.getHeaderMenu();
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { menu },
    });
  });

  /**
   * Update Draft Header Menu
   */
  static updateHeaderMenu = catchAsync(async (req: Request, res: Response) => {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(HttpCode.BAD_REQUEST).json({
        status: 'fail',
        message: 'items must be an array of menu items',
      });
    }
    const menu = await MenuService.updateDraftHeaderMenu(items);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { menu },
    });
  });

  /**
   * Publish Header Menu
   */
  static publishHeaderMenu = catchAsync(async (_req: Request, res: Response) => {
    const menu = await MenuService.publishHeaderMenu();
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Header menu published successfully',
      data: { menu },
    });
  });

  /**
   * Reset Header Menu
   */
  static resetHeaderMenu = catchAsync(async (_req: Request, res: Response) => {
    const menu = await MenuService.resetHeaderMenu();
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Header menu reset to default successfully',
      data: { menu },
    });
  });

  // ── FOOTER MENU HANDLERS ──────────────────────────────────────────────────
  /**
   * Get Footer Menu (Draft & Published)
   */
  static getFooterMenu = catchAsync(async (_req: Request, res: Response) => {
    const menu = await MenuService.getFooterMenu();
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { menu },
    });
  });

  /**
   * Update Draft Footer Menu
   */
  static updateFooterMenu = catchAsync(async (req: Request, res: Response) => {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(HttpCode.BAD_REQUEST).json({
        status: 'fail',
        message: 'items must be an array of footer sections',
      });
    }
    const menu = await MenuService.updateDraftFooterMenu(items);
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { menu },
    });
  });

  /**
   * Publish Footer Menu
   */
  static publishFooterMenu = catchAsync(async (_req: Request, res: Response) => {
    const menu = await MenuService.publishFooterMenu();
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Footer menu published successfully',
      data: { menu },
    });
  });

  /**
   * Reset Footer Menu
   */
  static resetFooterMenu = catchAsync(async (_req: Request, res: Response) => {
    const menu = await MenuService.resetFooterMenu();
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Footer menu reset to default successfully',
      data: { menu },
    });
  });
}
