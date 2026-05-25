import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import { protect, restrictTo } from '../middleware/auth';
import { createProductSchema, updateProductSchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/', ProductController.getAll);
router.get('/:idOrSlug', ProductController.getOne);

// Protected Admin-only routes
router.use(protect, restrictTo('ADMIN'));

router.post('/', validate(createProductSchema), ProductController.create);
router.put('/:id', validate(updateProductSchema), ProductController.update);
router.delete('/:id', ProductController.delete);

export default router;
