import { Router } from 'express';
import { PageController } from '../controllers/page.controller';
import { validate } from '../middleware/validate';
import { protect, restrictTo } from '../middleware/auth';
import { createPageSchema, updatePageSchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/:idOrSlug', PageController.getOne);
router.get('/', PageController.getAll);

// Protected Admin-only routes
router.use(protect, restrictTo('ADMIN'));

router.post('/', validate(createPageSchema), PageController.create);
router.put('/:id', validate(updatePageSchema), PageController.update);
router.delete('/:id', PageController.delete);

export default router;
