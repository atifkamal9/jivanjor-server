import { Router } from 'express';
import { UploadController, multerUpload } from '../controllers/upload.controller';
import { protect, restrictToUpload } from '../middleware/auth';

const router = Router();

// Protected upload routes: SUPER_ADMIN, ADMIN, or users with content permissions (e.g. manage_blogs)
router.use(protect, restrictToUpload);

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
