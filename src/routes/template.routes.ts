import { Router } from 'express';
import { TemplateController } from '../controllers/template.controller';
import { validate } from '../middleware/validate';
import { protect, restrictTo } from '../middleware/auth';
import { createTemplateSchema, updateTemplateSchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/active/:pageType', TemplateController.getActive);
router.get('/:idOrSlug', TemplateController.getOne);
router.get('/', TemplateController.getAll);

// Protected Admin-only routes
router.use(protect, restrictTo('ADMIN'));

router.post('/', validate(createTemplateSchema), TemplateController.create);
router.put('/:id', validate(updateTemplateSchema), TemplateController.update);
router.put('/:id/activate', TemplateController.activate);
router.delete('/:id', TemplateController.delete);

export default router;
