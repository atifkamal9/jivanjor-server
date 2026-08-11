import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema } from '../utils/validation';

const router = Router();

// Protect all routes in user management
router.use(protect);
router.use(restrictTo('SUPER_ADMIN', 'ADMIN'));

router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUser);
router.post('/', validate(createUserSchema), UserController.createUser);
router.put('/:id', validate(updateUserSchema), UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
