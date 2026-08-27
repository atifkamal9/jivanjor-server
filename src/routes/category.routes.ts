import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { validate } from '../middleware/validate';
import { protect, restrictToPermission } from '../middleware/auth';
import { createCategorySchema, updateCategorySchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/', CategoryController.getAll);
router.get('/:idOrSlug', CategoryController.getOne);

// Protected Admin routes
router.use(protect, restrictToPermission('manage_categories'));

router.post('/', validate(createCategorySchema), CategoryController.create);
router.put('/:id', validate(updateCategorySchema), CategoryController.update);
router.delete('/:id', CategoryController.delete);

export default router;
