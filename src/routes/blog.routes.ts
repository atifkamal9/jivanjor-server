import { Router } from 'express';
import { BlogController } from '../controllers/blog.controller';
import { validate } from '../middleware/validate';
import { protect, restrictTo } from '../middleware/auth';
import { createBlogSchema, updateBlogSchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/', BlogController.getAll);
router.get('/:idOrSlug', BlogController.getOne);

// Protected Admin-only routes
router.use(protect, restrictTo('ADMIN'));

router.post('/', validate(createBlogSchema), BlogController.create);
router.put('/:id', validate(updateBlogSchema), BlogController.update);
router.delete('/:id', BlogController.delete);

export default router;
