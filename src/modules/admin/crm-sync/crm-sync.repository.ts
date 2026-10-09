import { prisma } from '../../../config/db';
import { FormType, CrmSyncStatus, Prisma } from '@prisma/client';

export interface ListSubmissionsQuery {
  page?: number;
  limit?: number;
  formType?: FormType;
  status?: CrmSyncStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  ids?: string[];
}

function parseDateBoundary(dateStr: string, isEnd: boolean): Date {
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const time = isEnd ? '23:59:59.999' : '00:00:00.000';
    return new Date(`${trimmed}T${time}+05:30`);
  }
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? new Date() : d;
}

export class CrmSyncRepository {
  async listSubmissions(query: ListSubmissionsQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50000, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.FormSubmissionWhereInput = {};

    if (query.ids && query.ids.length > 0) {
      where.id = { in: query.ids };
    }
    if (query.formType) {
      where.formType = query.formType;
    }
    if (query.status) {
      where.zohoSyncStatus = query.status;
    }
    if (query.startDate || query.endDate) {
      where.submittedAt = {};
      if (query.startDate) {
        where.submittedAt.gte = parseDateBoundary(query.startDate, false);
      }
      if (query.endDate) {
        where.submittedAt.lte = parseDateBoundary(query.endDate, true);
      }
    }
    if (query.search) {
      const searchStr = query.search.trim();
      where.OR = [
        { crmExternalKey: { contains: searchStr, mode: 'insensitive' } },
        { fullName: { contains: searchStr, mode: 'insensitive' } },
        { mobileRaw: { contains: searchStr, mode: 'insensitive' } },
        { mobileNormalized: { contains: searchStr, mode: 'insensitive' } },
        { email: { contains: searchStr, mode: 'insensitive' } },
        { city: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    const [total, submissions] = await Promise.all([
      prisma.formSubmission.count({ where }),
      prisma.formSubmission.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          crmExternalKey: true,
          formType: true,
          fullName: true,
          firmName: true,
          mobileRaw: true,
          mobileNormalized: true,
          email: true,
          city: true,
          location: true,
          state: true,
          pinCode: true,
          queryType: true,
          interestedIn: true,
          lineOfBusiness: true,
          message: true,
          consentGiven: true,
          consentTextVersion: true,
          sourceUrl: true,
          referrerUrl: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          utmContent: true,
          utmTerm: true,
          gclid: true,
          fbclid: true,
          submittedAt: true,
          zohoSyncStatus: true,
          zohoContactId: true,
          zohoEnquiryId: true,
          zohoContactAction: true,
          zohoEnquiryAction: true,
          zohoSyncAttempts: true,
          zohoLastHttpStatus: true,
          zohoLastErrorCode: true,
          zohoLastErrorMessage: true,
          zohoLastAttemptAt: true,
          zohoSyncedAt: true,
          nextRetryAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSubmissionById(id: string) {
    const submission = await prisma.formSubmission.findUnique({
      where: { id },
      include: {
        attempts: {
          orderBy: { startedAt: 'desc' },
        },
        syncJob: true,
      },
    });

    if (!submission) return null;

    // Fetch related admin audit logs for this submission
    const auditLogs = await prisma.adminAuditLog.findMany({
      where: { submissionId: id },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ...submission,
      adminAuditLogs: auditLogs,
    };
  }

  async requeueSubmission(submissionId: string) {
    return prisma.$transaction(async (tx) => {
      const submission = await tx.formSubmission.update({
        where: { id: submissionId },
        data: {
          zohoSyncStatus: CrmSyncStatus.PENDING,
          zohoLastErrorCode: null,
          zohoLastErrorMessage: null,
          nextRetryAt: null,
        },
      });

      await tx.crmSyncJob.upsert({
        where: { submissionId },
        create: {
          submissionId,
          status: CrmSyncStatus.PENDING,
          availableAt: new Date(),
        },
        update: {
          status: CrmSyncStatus.PENDING,
          availableAt: new Date(),
          lockedAt: null,
          workerId: null,
        },
      });

      return submission;
    });
  }

  async getHealthMetrics() {
    const [statusCounts, oldestPendingJob, lastSyncedSubmission] = await Promise.all([
      prisma.formSubmission.groupBy({
        by: ['zohoSyncStatus'],
        _count: { id: true },
      }),
      prisma.crmSyncJob.findFirst({
        where: { status: CrmSyncStatus.PENDING },
        orderBy: { availableAt: 'asc' },
        select: { availableAt: true },
      }),
      prisma.formSubmission.findFirst({
        where: { zohoSyncStatus: CrmSyncStatus.SYNCED },
        orderBy: { zohoSyncedAt: 'desc' },
        select: { zohoSyncedAt: true },
      }),
    ]);

    const countsMap: Record<string, number> = {
      PENDING: 0,
      PROCESSING: 0,
      RETRY_SCHEDULED: 0,
      SYNCED: 0,
      FAILED: 0,
      MANUAL_REVIEW: 0,
    };

    statusCounts.forEach((sc) => {
      countsMap[sc.zohoSyncStatus] = sc._count.id;
    });

    const totalSubmissions = Object.values(countsMap).reduce((a, b) => a + b, 0);
    const successRate = totalSubmissions > 0 ? (countsMap.SYNCED / totalSubmissions) * 100 : 100;
    const oldestPendingAgeSeconds = oldestPendingJob
      ? Math.round((Date.now() - oldestPendingJob.availableAt.getTime()) / 1000)
      : 0;

    return {
      queueDepth: countsMap.PENDING + countsMap.RETRY_SCHEDULED,
      counts: countsMap,
      totalSubmissions,
      syncSuccessRate: parseFloat(successRate.toFixed(2)),
      oldestPendingAgeSeconds,
      lastSuccessAt: lastSyncedSubmission?.zohoSyncedAt || null,
    };
  }
}

export const crmSyncRepository = new CrmSyncRepository();
