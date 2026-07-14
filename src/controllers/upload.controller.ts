import { Request, Response } from 'express';
import multer from 'multer';
import { UploadService } from '../services/upload.service';
import { catchAsync } from '../middleware/errorHandler';
import { AppError, HttpCode } from '../utils/errors';

// Store files in memory — no temp disk writes
const storage = multer.memoryStorage();

export const multerUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB hard limit at multer level
});

export class UploadController {
  /**
   * POST /api/upload
   * Multipart form-data: { file, bucket?, folder? }
   * Protected: ADMIN only
   */
  static upload = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('No file provided. Send the file as multipart/form-data with field name "file".', HttpCode.BAD_REQUEST);
    }

    const bucket = typeof req.body.bucket === 'string' ? req.body.bucket : undefined;
    const folder = typeof req.body.folder === 'string' ? req.body.folder : undefined;

    const result = await UploadService.upload({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      bucket,
      folder,
    });

    return res.status(HttpCode.CREATED).json({
      status: 'success',
      data: result,
    });
  });

  /**
   * DELETE /api/upload
   * Body: { path, bucket? }
   * Protected: ADMIN only
   */
  static delete = catchAsync(async (req: Request, res: Response) => {
    const { path: filePath, bucket } = req.body as { path?: string; bucket?: string };

    if (!filePath) {
      throw new AppError('File path is required.', HttpCode.BAD_REQUEST);
    }

    await UploadService.delete(filePath, bucket);

    return res.status(HttpCode.OK).json({
      status: 'success',
      message: 'File deleted successfully.',
    });
  });
}
