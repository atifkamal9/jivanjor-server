import { Router } from 'express';
import { SEOController } from '../controllers/seo.controller';
import { validate } from '../middleware/validate';
import { protect, restrictTo } from '../middleware/auth';
import { createOrUpdateSEOSchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/', SEOController.getOne);

// Protected Admin-only routes
router.use(protect, restrictTo('ADMIN'));

router.post('/', validate(createOrUpdateSEOSchema), SEOController.upsert);
router.delete('/', SEOController.delete);

export default router;
