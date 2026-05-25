import { prisma } from '../config/db';
import { AppError, HttpCode } from '../utils/errors';
import { slugify } from '../utils/slugify';
import { z } from 'zod';
import { createIssueSchema, updateIssueSchema } from '../utils/validation';

type CreateIssueInput = z.infer<typeof createIssueSchema>['body'];
type UpdateIssueInput = z.infer<typeof updateIssueSchema>['body'];

export class IssueService {
  /**
   * Get all issues
   */
  static async getAll() {
    return prisma.issue.findMany({
      orderBy: { issueTitle: 'asc' },
    });
  }

  /**
   * Get issue by ID or Slug
   */
  static async getByIdOrSlug(idOrSlug: string) {
    const isUuid = idOrSlug.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);

    const issue = await prisma.issue.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
    });

    if (!issue) {
      throw new AppError('Issue not found', HttpCode.NOT_FOUND);
    }

    // Fetch SEO metadata if it exists
    const seo = await prisma.sEOMetadata.findUnique({
      where: {
        pageType_pageId: {
          pageType: 'ISSUE',
          pageId: issue.id,
        },
      },
    });

    return {
      ...issue,
      seo,
    };
  }

  /**
   * Create issue
   */
  static async create(input: CreateIssueInput) {
    const { issueTitle, problem, solution } = input;
    const slug = slugify(issueTitle);

    // Validate slug uniqueness
    const existing = await prisma.issue.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new AppError(`Issue slug '${slug}' already exists. Please choose a different title.`, HttpCode.CONFLICT);
    }

    return prisma.issue.create({
      data: {
        issueTitle,
        slug,
        problem,
        solution,
      },
    });
  }

  /**
   * Update issue
   */
  static async update(id: string, input: UpdateIssueInput) {
    const { issueTitle, problem, solution } = input;

    // Verify issue exists
    const issue = await prisma.issue.findUnique({
      where: { id },
    });
    if (!issue) {
      throw new AppError('Issue not found', HttpCode.NOT_FOUND);
    }

    const dataToUpdate: any = {};

    if (issueTitle) {
      const slug = slugify(issueTitle);
      if (slug !== issue.slug) {
        const existing = await prisma.issue.findUnique({
          where: { slug },
        });
        if (existing) {
          throw new AppError(`Issue slug '${slug}' already exists.`, HttpCode.CONFLICT);
        }
        dataToUpdate.issueTitle = issueTitle;
        dataToUpdate.slug = slug;
      } else {
        dataToUpdate.issueTitle = issueTitle;
      }
    }

    if (problem) {
      dataToUpdate.problem = problem;
    }

    if (solution) {
      dataToUpdate.solution = solution;
    }

    return prisma.issue.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  /**
   * Delete issue
   */
  static async delete(id: string) {
    const issue = await prisma.issue.findUnique({
      where: { id },
    });
    if (!issue) {
      throw new AppError('Issue not found', HttpCode.NOT_FOUND);
    }

    return prisma.issue.delete({
      where: { id },
    });
  }
}
