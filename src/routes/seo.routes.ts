import { Router } from 'express';
import { SEOController } from '../controllers/seo.controller';
import { validate } from '../middleware/validate';
import { protect, restrictToPermission } from '../middleware/auth';
import { createOrUpdateSEOSchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/', SEOController.getOne);

// Protected Admin routes (Settings & Content Managers can manage SEO metadata)
router.use(
  protect,
  restrictToPermission(
    'manage_settings',
    'manage_blogs',
    'manage_products',
    'manage_categories',
    'manage_use_cases',
    'manage_pages'
  )
);

router.post('/', validate(createOrUpdateSEOSchema), SEOController.upsert);
router.delete('/', SEOController.delete);
router.delete('/:id', SEOController.deleteById);

export default router;
