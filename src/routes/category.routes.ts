import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { validate } from '../middleware/validate';
import { protect, restrictTo } from '../middleware/auth';
import { createCategorySchema, updateCategorySchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/', CategoryController.getAll);
router.get('/:idOrSlug', CategoryController.getOne);

// Protected Admin-only routes
router.use(protect, restrictTo('ADMIN'));

router.post('/', validate(createCategorySchema), CategoryController.create);
router.put('/:id', validate(updateCategorySchema), CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;
