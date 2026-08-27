import { Router } from 'express';
import { BlogController } from '../controllers/blog.controller';
import { validate } from '../middleware/validate';
import { protect, restrictToPermission } from '../middleware/auth';
import { createBlogSchema, updateBlogSchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/', BlogController.getAll);
router.get('/:idOrSlug', BlogController.getOne);

// Protected Admin routes
router.use(protect, restrictToPermission('manage_blogs'));

router.post('/', validate(createBlogSchema), BlogController.create);
router.put('/:id', validate(updateBlogSchema), BlogController.update);
router.delete('/:id', BlogController.delete);

export default router;
