import { Router } from 'express';
import { IssueController } from '../controllers/issue.controller';
import { validate } from '../middleware/validate';
import { protect, restrictTo } from '../middleware/auth';
import { createIssueSchema, updateIssueSchema } from '../utils/validation';

const router = Router();

// Public routes
router.get('/', IssueController.getAll);
router.get('/:idOrSlug', IssueController.getOne);

// Protected Admin-only routes
router.use(protect, restrictTo('ADMIN'));

router.post('/', validate(createIssueSchema), IssueController.create);
router.put('/:id', validate(updateIssueSchema), IssueController.update);
router.delete('/:id', IssueController.delete);

export default router;
