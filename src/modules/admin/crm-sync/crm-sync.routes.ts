import { Router, Request, Response } from 'express';
import { protect, restrictToPermission } from '../../../middleware/auth';
import { catchAsync } from '../../../middleware/errorHandler';
import { crmSyncService } from './crm-sync.service';

const router = Router();

// Protect all admin sync management routes
router.use(protect);
router.use(restrictToPermission('manage_forms'));

/**
 * GET /api/admin/form-submissions/health
 * Returns queue depth, oldest pending age, failure rates, last success
 */
router.get(
  '/health',
  catchAsync(async (_req: Request, res: Response) => {
    const health = await crmSyncService.getHealth();
    res.status(200).json({
      status: 'success',
      data: health,
    });
  })
);

/**
 * GET /api/admin/form-submissions
 * Returns paginated & filtered list of form submissions
 */
router.get(
  '/',
  catchAsync(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const formType = req.query.formType as any;
    const status = req.query.status as any;
    const search = req.query.search as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const result = await crmSyncService.getSubmissions({
      page,
      limit,
      formType,
      status,
      search,
      startDate,
      endDate,
    });

    res.status(200).json({
      status: 'success',
      data: result.submissions,
      pagination: result.pagination,
    });
  })
);

/**
 * GET /api/admin/form-submissions/:id
 * Returns detailed record payload, CRM sync status, attempt history, and admin audit log
 */
router.get(
  '/:id',
  catchAsync(async (req: Request, res: Response) => {
    const submission = await crmSyncService.getSubmissionDetail(req.params.id);
    res.status(200).json({
      status: 'success',
      data: submission,
    });
  })
);

/**
 * POST /api/admin/form-submissions/:id/retry
 * Manually requeues a failed or manual-review submission for CRM sync
 */
router.post(
  '/:id/retry',
  catchAsync(async (req: Request, res: Response) => {
    const adminUserId = req.user!.id;
    const reason = req.body?.reason;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await crmSyncService.retrySubmission(
      req.params.id,
      adminUserId,
      reason,
      ipAddress
    );

    res.status(202).json(result);
  })
);

/**
 * POST /api/admin/form-submissions/batch-retry
 * Manually requeues multiple failed/manual-review submissions in a batch
 */
router.post(
  '/batch-retry',
  catchAsync(async (req: Request, res: Response) => {
    const adminUserId = req.user!.id;
    const submissionIds = req.body?.submissionIds || [];
    const reason = req.body?.reason;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await crmSyncService.batchRetrySubmissions(
      submissionIds,
      adminUserId,
      reason,
      ipAddress
    );

    res.status(202).json({
      status: 'success',
      data: result,
    });
  })
);

export default router;
