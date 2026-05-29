import { prisma } from '../config/db';
import { AppError, HttpCode } from '../utils/errors';
import { slugify } from '../utils/slugify';
import { z } from 'zod';
import { createPageSchema, updatePageSchema } from '../utils/validation';

type CreatePageInput = z.infer<typeof createPageSchema>['body'];
type UpdatePageInput = z.infer<typeof updatePageSchema>['body'];

export class PageService {
  /**
   * Get all pages
   */
  static async getAll() {
    return prisma.page.findMany({
      orderBy: { title: 'asc' },
    });
  }

  /**
   * Get page by ID or Slug
   */
  static async getByIdOrSlug(idOrSlug: string) {
    const isUuid = idOrSlug.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);

    const page = await prisma.page.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: {
        activeTemplate: true,
      },
    });

    if (!page) {
      throw new AppError('Page not found', HttpCode.NOT_FOUND);
    }

    return page;
  }

  /**
   * Create a dynamic Page
   */
  static async create(input: CreatePageInput) {
    const { title, description } = input;
    const slug = slugify(title);

    // Validate slug uniqueness
    const existing = await prisma.page.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new AppError(`Page with slug '${slug}' already exists. Please choose a different title.`, HttpCode.CONFLICT);
    }

    return prisma.page.create({
      data: {
        title,
        slug,
        description,
      },
    });
  }

  /**
   * Update a Page
   */
  static async update(id: string, input: UpdatePageInput) {
    const { title, description, activeTemplateId } = input;

    // Verify page exists
    const page = await prisma.page.findUnique({
      where: { id },
    });
    if (!page) {
      throw new AppError('Page not found', HttpCode.NOT_FOUND);
    }

    const dataToUpdate: any = {};

    if (title) {
      const slug = slugify(title);
      if (slug !== page.slug) {
        const existing = await prisma.page.findUnique({
          where: { slug },
        });
        if (existing) {
          throw new AppError(`Page with slug '${slug}' already exists.`, HttpCode.CONFLICT);
        }
        dataToUpdate.title = title;
        dataToUpdate.slug = slug;
      } else {
        dataToUpdate.title = title;
      }
    }

    if (description !== undefined) {
      dataToUpdate.description = description;
    }

    if (activeTemplateId !== undefined) {
      if (activeTemplateId !== null) {
        // Verify template exists in global pool
        const template = await prisma.pageTemplate.findUnique({
          where: { id: activeTemplateId },
        });
        if (!template) {
          throw new AppError('Active template must exist in the templates pool', HttpCode.BAD_REQUEST);
        }
      }
      dataToUpdate.activeTemplateId = activeTemplateId;
    }

    return prisma.page.update({
      where: { id },
      data: dataToUpdate,
      include: {
        activeTemplate: true,
      },
    });
  }

  /**
   * Delete a Page
   */
  static async delete(id: string) {
    const page = await prisma.page.findUnique({
      where: { id },
    });
    if (!page) {
      throw new AppError('Page not found', HttpCode.NOT_FOUND);
    }

    return prisma.page.delete({
      where: { id },
    });
  }
}
