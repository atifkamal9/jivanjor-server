import { Router } from 'express';
import { UploadController, multerUpload } from '../controllers/upload.controller';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// All upload routes require authentication and ADMIN role
router.use(protect, restrictTo('ADMIN'));

/**
 * POST /api/upload
 * Upload an image or video to Supabase Storage.
 * Form fields:
 *   - file    (required) — the file to upload
 *   - bucket  (optional) — storage bucket, defaults to "media"
 *   - folder  (optional) — sub-folder path, e.g. "products", "blog"
 */
router.post('/', multerUpload.single('file'), UploadController.upload);

/**
 * DELETE /api/upload
 * Delete a file from Supabase Storage.
 * Body: { path: string, bucket?: string }
 */
router.delete('/', UploadController.delete);

export default router;
