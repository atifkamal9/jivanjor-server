import { Router } from 'express';
import { UseCaseController } from '../controllers/useCase.controller';
import { validate } from '../middleware/validate';
import { protect, restrictToPermission } from '../middleware/auth';
import { createUseCaseSchema, updateUseCaseSchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/', UseCaseController.getAll);
router.get('/:idOrSlug', UseCaseController.getOne);

// Protected Admin routes
router.use(protect, restrictToPermission('manage_use_cases', 'manage_blogs'));

router.post('/', validate(createUseCaseSchema), UseCaseController.create);
router.put('/:id', validate(updateUseCaseSchema), UseCaseController.update);
router.delete('/:id', UseCaseController.delete);

export default router;
