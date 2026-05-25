import { Router } from 'express';
import { UseCaseController } from '../controllers/useCase.controller';
import { validate } from '../middleware/validate';
import { protect, restrictTo } from '../middleware/auth';
import { createUseCaseSchema, updateUseCaseSchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/', UseCaseController.getAll);
router.get('/:idOrSlug', UseCaseController.getOne);

// Protected Admin-only routes
router.use(protect, restrictTo('ADMIN'));

router.post('/', validate(createUseCaseSchema), UseCaseController.create);
router.put('/:id', validate(updateUseCaseSchema), UseCaseController.update);
router.delete('/:id', UseCaseController.delete);

export default router;
