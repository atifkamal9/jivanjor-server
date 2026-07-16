import { prisma } from '../config/db';
import { AppError, HttpCode } from '../utils/errors';
import { slugify } from '../utils/slugify';
import { z } from 'zod';
import { createTemplateSchema, updateTemplateSchema } from '../utils/validation';

type CreateTemplateInput = z.infer<typeof createTemplateSchema>['body'];
type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>['body'];

export class TemplateService {
  /**
   * Get all templates
   */
  static async getAll() {
    return prisma.pageTemplate.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Get template by ID or Slug
   */
  static async getByIdOrSlug(idOrSlug: string) {
    const isUuid = idOrSlug.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);

    const template = await prisma.pageTemplate.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
    });

    if (!template) {
      throw new AppError('Template not found', HttpCode.NOT_FOUND);
    }

    return template;
  }

  /**
   * Get active template for a Page Slug
   */
  static async getActiveForPageSlug(pageSlug: string) {
    // First, verify page exists and load its active template
    const page = await prisma.page.findUnique({
      where: { slug: pageSlug },
      include: {
        activeTemplate: true,
      },
    });

    if (!page) {
      throw new AppError(`Page with slug '${pageSlug}' not found`, HttpCode.NOT_FOUND);
    }

    if (!page.activeTemplate) {
      throw new AppError(`No active template selected for page '${page.title}'`, HttpCode.NOT_FOUND);
    }

    const template = page.activeTemplate;
    if (page.sections && typeof page.sections === 'object') {
      template.sections = page.sections;
    }

    return template;
  }

  /**
   * Create a new template (globally decoupled)
   */
  static async create(input: CreateTemplateInput) {
    const { name, sections } = input;
    const slug = slugify(name);

    // Validate uniqueness of slug
    const existing = await prisma.pageTemplate.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new AppError(`Template with name '${name}' (slug '${slug}') already exists.`, HttpCode.CONFLICT);
    }

    return prisma.pageTemplate.create({
      data: {
        name,
        slug,
        sections: sections as any,
      },
    });
  }

  /**
   * Update a template (globally decoupled)
   */
  static async update(id: string, input: UpdateTemplateInput) {
    const { name, sections } = input;

    // Verify template exists
    const template = await prisma.pageTemplate.findUnique({
      where: { id },
    });
    if (!template) {
      throw new AppError('Template not found', HttpCode.NOT_FOUND);
    }

    const dataToUpdate: any = {};

    if (name) {
      const slug = slugify(name);
      if (slug !== template.slug) {
        const existing = await prisma.pageTemplate.findUnique({
          where: { slug },
        });
        if (existing) {
          throw new AppError(`Template with name '${name}' (slug '${slug}') already exists.`, HttpCode.CONFLICT);
        }
        dataToUpdate.name = name;
        dataToUpdate.slug = slug;
      } else {
        dataToUpdate.name = name;
      }
    }

    if (sections) {
      dataToUpdate.sections = sections;
    }

    return prisma.pageTemplate.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  /**
   * Delete a template
   */
  static async delete(id: string) {
    const template = await prisma.pageTemplate.findUnique({
      where: { id },
    });
    if (!template) {
      throw new AppError('Template not found', HttpCode.NOT_FOUND);
    }

    // If this template is currently active for any page, nullify the pointer
    const activePages = await prisma.page.findMany({
      where: { activeTemplateId: id },
    });

    if (activePages.length > 0) {
      await prisma.page.updateMany({
        where: { activeTemplateId: id },
        data: { activeTemplateId: null },
      });
    }

    return prisma.pageTemplate.delete({
      where: { id },
    });
  }

  /**
   * Activate a template (Deprecated inside TemplateService as template page-mapping is handled directly at Page levels)
   */
  static async activate(id: string) {
    const template = await prisma.pageTemplate.findUnique({
      where: { id },
    });
    if (!template) {
      throw new AppError('Template not found', HttpCode.NOT_FOUND);
    }

    return this.getByIdOrSlug(id);
  }
}
