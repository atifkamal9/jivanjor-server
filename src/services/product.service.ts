import { prisma } from '../config/db';
import { AppError, HttpCode } from '../utils/errors';
import { slugify } from '../utils/slugify';
import { z } from 'zod';
import { createProductSchema, updateProductSchema } from '../utils/validation';

type CreateProductInput = z.infer<typeof createProductSchema>['body'];
type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];

export interface ProductQueryParams {
  categoryId?: string;
  materialId?: string;
  search?: string;
  page?: string;
  limit?: string;
}

export class ProductService {
  /**
   * Get all products with optional filters and pagination
   */
  static async getAll(params: ProductQueryParams) {
    const { categoryId, materialId, search, page = '1', limit = '10' } = params;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build Prisma query filter object
    const whereClause: any = {};

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (materialId) {
      whereClause.materialId = materialId;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Run parallel queries for pagination metadata and results
    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
        skip,
        take: limitNum,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          material: {
            select: { id: true, materialName: true },
          },
        },
      }),
    ]);

    return {
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get product by ID or Slug
   */
  static async getByIdOrSlug(idOrSlug: string) {
    const isUuid = idOrSlug.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);

    const product = await prisma.product.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: {
        category: true,
        material: true,
      },
    });

    if (!product) {
      throw new AppError('Product not found', HttpCode.NOT_FOUND);
    }

    // Fetch SEO metadata if it exists
    const seo = await prisma.sEOMetadata.findUnique({
      where: {
        pageType_pageId: {
          pageType: 'PRODUCT',
          pageId: product.id,
        },
      },
    });

    return {
      ...product,
      seo,
    };
  }

  /**
   * Create a product
   */
  static async create(input: CreateProductInput) {
    const { name, description, categoryId, materialId, metadata } = input;
    const slug = slugify(name);

    // 1. Check slug uniqueness
    const existing = await prisma.product.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new AppError(`Product slug '${slug}' already exists. Please choose a different name.`, HttpCode.CONFLICT);
    }

    // 2. Validate category exists
    const category = await prisma.productCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new AppError('Category not found', HttpCode.NOT_FOUND);
    }

    // 3. Validate material exists if provided
    if (materialId) {
      const material = await prisma.material.findUnique({
        where: { id: materialId },
      });
      if (!material) {
        throw new AppError('Material not found', HttpCode.NOT_FOUND);
      }
    }

    // 4. Create product
    return prisma.product.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        materialId,
        metadata: metadata || null,
      },
    });
  }

  /**
   * Update product
   */
  static async update(id: string, input: UpdateProductInput) {
    const { name, description, categoryId, materialId, metadata } = input;

    // 1. Verify product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new AppError('Product not found', HttpCode.NOT_FOUND);
    }

    const dataToUpdate: any = {};

    // 2. Validate new category
    if (categoryId) {
      const category = await prisma.productCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new AppError('Category not found', HttpCode.NOT_FOUND);
      }
      dataToUpdate.categoryId = categoryId;
    }

    // 3. Validate new material
    if (materialId !== undefined) {
      if (materialId !== null) {
        const material = await prisma.material.findUnique({
          where: { id: materialId },
        });
        if (!material) {
          throw new AppError('Material not found', HttpCode.NOT_FOUND);
        }
      }
      dataToUpdate.materialId = materialId;
    }

    // 4. Regenerate slug on name change
    if (name) {
      const slug = slugify(name);
      if (slug !== product.slug) {
        const existing = await prisma.product.findUnique({
          where: { slug },
        });
        if (existing) {
          throw new AppError(`Product slug '${slug}' already exists.`, HttpCode.CONFLICT);
        }
        dataToUpdate.name = name;
        dataToUpdate.slug = slug;
      } else {
        dataToUpdate.name = name;
      }
    }

    if (description) {
      dataToUpdate.description = description;
    }

    if (metadata !== undefined) {
      dataToUpdate.metadata = metadata;
    }

    return prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  /**
   * Delete product
   */
  static async delete(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new AppError('Product not found', HttpCode.NOT_FOUND);
    }

    return prisma.product.delete({
      where: { id },
    });
  }
}
