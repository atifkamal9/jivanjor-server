import { Request, Response } from 'express';
import { SettingService } from '../services/setting.service';
import { catchAsync } from '../middleware/errorHandler';
import { HttpCode } from '../utils/errors';

export class SettingController {
  /**
   * Get Site Settings (Logos, Social Media Links)
   */
  static getSettings = catchAsync(async (_req: Request, res: Response) => {
    const settings = await SettingService.getSettings();
    return res.status(HttpCode.OK).json({
      status: 'success',
      data: { settings },
    });
  });

  /**
   * Update Site Settings
   */
  static updateSettings = catchAsync(async (req: Request, res: Response) => {
    const settings = await SettingService.updateSettings(req.body);
    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'Site settings updated successfully',
      data: { settings },
    });
  });
}
