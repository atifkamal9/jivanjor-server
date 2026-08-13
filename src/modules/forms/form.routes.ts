import { Router, Request, Response } from 'express';
import { catchAsync } from '../../middleware/errorHandler';
import {
  contactFormSchema,
  dealerFormSchema,
  contractorFormSchema,
} from './form.validation';
import { formSubmissionService } from './form-submission.service';
import { AppError, HttpCode } from '../../utils/errors';

const router = Router();

/**
 * POST /api/forms/contact
 * Public endpoint for Contact Us form submissions
 */
router.post(
  '/contact',
  catchAsync(async (req: Request, res: Response) => {
    const parseResult = contactFormSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new AppError(`Validation error: ${errorMsg}`, HttpCode.BAD_REQUEST);
    }

    const result = await formSubmissionService.processContactSubmission(parseResult.data);

    res.status(201).json({
      status: 'success',
      message: 'Form submitted successfully',
      data: result,
    });
  })
);

/**
 * POST /api/forms/dealer
 * Public endpoint for Become a Dealer form submissions
 */
router.post(
  '/dealer',
  catchAsync(async (req: Request, res: Response) => {
    const parseResult = dealerFormSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new AppError(`Validation error: ${errorMsg}`, HttpCode.BAD_REQUEST);
    }

    const result = await formSubmissionService.processDealerSubmission(parseResult.data);

    res.status(201).json({
      status: 'success',
      message: 'Dealer enquiry submitted successfully',
      data: result,
    });
  })
);

/**
 * POST /api/forms/contractor
 * Public endpoint for Contractor Connect form submissions
 */
router.post(
  '/contractor',
  catchAsync(async (req: Request, res: Response) => {
    const parseResult = contractorFormSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new AppError(`Validation error: ${errorMsg}`, HttpCode.BAD_REQUEST);
    }

    const result = await formSubmissionService.processContractorSubmission(parseResult.data);

    res.status(201).json({
      status: 'success',
      message: 'Contractor enquiry submitted successfully',
      data: result,
    });
  })
);

export default router;
