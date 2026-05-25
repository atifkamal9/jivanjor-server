import { Router } from 'express';
import { MaterialController } from '../controllers/material.controller';
import { validate } from '../middleware/validate';
import { protect, restrictTo } from '../middleware/auth';
import { createMaterialSchema, updateMaterialSchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/', MaterialController.getAll);
router.get('/:id', MaterialController.getOne);

// Protected Admin-only routes
router.use(protect, restrictTo('ADMIN'));

router.post('/', validate(createMaterialSchema), MaterialController.create);
router.put('/:id', validate(updateMaterialSchema), MaterialController.update);
router.delete('/:id', MaterialController.delete);

export default router;
