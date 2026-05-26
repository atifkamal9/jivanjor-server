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
   * Get the active template for a page type
   */
  static async getActive(pageType: string) {
    const template = await prisma.pageTemplate.findFirst({
      where: {
        pageType: pageType.toUpperCase(),
        isActive: true,
      },
    });

    if (!template) {
      throw new AppError(`No active template found for page type ${pageType}`, HttpCode.NOT_FOUND);
    }

    return template;
  }

  /**
   * Create a new template
   */
  static async create(input: CreateTemplateInput) {
    const { name, pageType, sections } = input;
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
        pageType: pageType.toUpperCase(),
        isActive: false,
        sections: sections as any,
      },
    });
  }

  /**
   * Update a template
   */
  static async update(id: string, input: UpdateTemplateInput) {
    const { name, pageType, sections, isActive } = input;

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

    if (pageType) {
      dataToUpdate.pageType = pageType.toUpperCase();
    }

    if (sections) {
      dataToUpdate.sections = sections;
    }

    if (isActive !== undefined) {
      dataToUpdate.isActive = isActive;
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

    return prisma.pageTemplate.delete({
      where: { id },
    });
  }

  /**
   * Activate a template for its page type (setting all others of same pageType to false)
   */
  static async activate(id: string) {
    const template = await prisma.pageTemplate.findUnique({
      where: { id },
    });
    if (!template) {
      throw new AppError('Template not found', HttpCode.NOT_FOUND);
    }

    // Set all other templates of same pageType to inactive, and this one to active
    await prisma.$transaction([
      prisma.pageTemplate.updateMany({
        where: {
          pageType: template.pageType,
          id: { not: id },
        },
        data: { isActive: false },
      }),
      prisma.pageTemplate.update({
        where: { id },
        data: { isActive: true },
      }),
    ]);

    return this.getByIdOrSlug(id);
  }
}
