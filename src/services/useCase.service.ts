import { prisma } from '../config/db';
import { AppError, HttpCode } from '../utils/errors';
import { slugify } from '../utils/slugify';


export class UseCaseService {
  /**
   * Get all use cases
   */
  static async getAll() {
    return prisma.useCase.findMany({
      orderBy: { title: 'asc' },
    });
  }

  /**
   * Get use case by ID or Slug
   */
  static async getByIdOrSlug(idOrSlug: string) {
    const isUuid = idOrSlug.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);

    const useCase = await prisma.useCase.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
    });

    if (!useCase) {
      throw new AppError('Use case not found', HttpCode.NOT_FOUND);
    }

    // Fetch SEO metadata if it exists
    const seo = await prisma.sEOMetadata.findUnique({
      where: {
        pageType_pageId: {
          pageType: 'USE_CASE',
          pageId: useCase.id,
        },
      },
    });

    return {
      ...useCase,
      seo,
    };
  }

  /**
   * Create use case
   */
  static async create(input: any) {
    const { title, description, content, category, image } = input;
    const slug = slugify(title);

    // Validate slug uniqueness
    const existing = await prisma.useCase.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new AppError(`Use case slug '${slug}' already exists. Please choose a different title.`, HttpCode.CONFLICT);
    }

    return prisma.useCase.create({
      data: {
        title,
        slug,
        description,
        content: content || null,
        category: category || null,
        image: image || null,
      },
    });
  }

  /**
   * Update use case
   */
  static async update(id: string, input: any) {
    const { title, description, content, category, image } = input;

    // Verify use case exists
    const useCase = await prisma.useCase.findUnique({
      where: { id },
    });
    if (!useCase) {
      throw new AppError('Use case not found', HttpCode.NOT_FOUND);
    }

    const dataToUpdate: any = {};

    if (title) {
      const slug = slugify(title);
      if (slug !== useCase.slug) {
        const existing = await prisma.useCase.findUnique({
          where: { slug },
        });
        if (existing) {
          throw new AppError(`Use case slug '${slug}' already exists.`, HttpCode.CONFLICT);
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
    if (content !== undefined) {
      dataToUpdate.content = content;
    }
    if (category !== undefined) {
      dataToUpdate.category = category;
    }
    if (image !== undefined) {
      dataToUpdate.image = image;
    }

    return prisma.useCase.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  /**
   * Delete use case
   */
  static async delete(id: string) {
    const useCase = await prisma.useCase.findUnique({
      where: { id },
    });
    if (!useCase) {
      throw new AppError('Use case not found', HttpCode.NOT_FOUND);
    }

    return prisma.useCase.delete({
      where: { id },
    });
  }
}
