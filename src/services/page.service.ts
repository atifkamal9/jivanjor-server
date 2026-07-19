import { z } from 'zod';
import { prisma } from '../config/db';
import { AppError, HttpCode } from '../utils/errors';
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
    const { title, description, slug, activeTemplateId, sections } = input;
    const normalizedSlug = slug.trim().toLowerCase();

    // Validate slug uniqueness
    const existing = await prisma.page.findUnique({
      where: { slug: normalizedSlug },
    });
    if (existing) {
      throw new AppError(`Page with slug '${normalizedSlug}' already exists. Please choose a different slug.`, HttpCode.CONFLICT);
    }

    if (activeTemplateId) {
      const template = await prisma.pageTemplate.findUnique({
        where: { id: activeTemplateId },
      });
      if (!template) {
        throw new AppError('Active template must exist in the templates pool', HttpCode.BAD_REQUEST);
      }
    }

    return prisma.page.create({
      data: {
        title,
        slug: normalizedSlug,
        description,
        activeTemplateId: activeTemplateId || null,
        sections: (sections as any) || undefined,
      },
    });
  }

  /**
   * Update a Page
   */
  static async update(id: string, input: UpdatePageInput) {
    const { title, description, activeTemplateId, slug, sections } = input;

    // Verify page exists
    const page = await prisma.page.findUnique({
      where: { id },
    });
    if (!page) {
      throw new AppError('Page not found', HttpCode.NOT_FOUND);
    }

    const dataToUpdate: any = {};

    if (title) {
      dataToUpdate.title = title;
    }

    if (slug !== undefined) {
      const normalizedSlug = slug.trim().toLowerCase();
      if (normalizedSlug !== page.slug) {
        // Prevent changing landing/home page slug
        if (page.slug === 'home') {
          throw new AppError("The home page slug is fixed to 'home' and cannot be modified.", HttpCode.BAD_REQUEST);
        }
        const existing = await prisma.page.findUnique({
          where: { slug: normalizedSlug },
        });
        if (existing) {
          throw new AppError(`Page with slug '${normalizedSlug}' already exists.`, HttpCode.CONFLICT);
        }
        dataToUpdate.slug = normalizedSlug;
      }
    }

    if (description !== undefined) {
      dataToUpdate.description = description;
    }

    if (sections !== undefined) {
      dataToUpdate.sections = sections;
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
