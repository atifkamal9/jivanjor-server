import { prisma } from '../config/db';
import { AppError, HttpCode } from '../utils/errors';
import { slugify } from '../utils/slugify';
import { z } from 'zod';
import { createCategorySchema, updateCategorySchema } from '../utils/validation';

type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];

export class CategoryService {
  /**
   * Helper to build category tree
   */
  private static buildTree(flatCategories: any[], parentId: string | null = null): any[] {
    return flatCategories
      .filter((cat) => cat.parentId === parentId)
      .map((cat) => ({
        ...cat,
        children: CategoryService.buildTree(flatCategories, cat.id),
      }));
  }

  /**
   * Get all categories
   */
  static async getAll(treeMode = false) {
    const categories = await prisma.productCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (treeMode) {
      return CategoryService.buildTree(categories, null);
    }

    return categories;
  }

  /**
   * Get category by ID or Slug
   */
  static async getByIdOrSlug(idOrSlug: string) {
    const isUuid = idOrSlug.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
    
    const category = await prisma.productCategory.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: {
        parent: true,
        children: true,
        products: {
          include: {
            material: true
          }
        },
      },
    });

    if (!category) {
      throw new AppError('Product category not found', HttpCode.NOT_FOUND);
    }

    return category;
  }

  /**
   * Create a new category
   */
  static async create(input: CreateCategoryInput) {
    const { name, parentId, description } = input;
    const slug = slugify(name);

    // Check slug uniqueness
    const existing = await prisma.productCategory.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new AppError(`Category slug '${slug}' already exists. Please choose a different name.`, HttpCode.CONFLICT);
    }

    // Verify parent exists if provided
    if (parentId) {
      const parent = await prisma.productCategory.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new AppError('Parent category not found', HttpCode.NOT_FOUND);
      }
    }

    return prisma.productCategory.create({
      data: {
        name,
        slug,
        parentId,
        description,
      },
    });
  }

  /**
   * Update category
   */
  static async update(id: string, input: UpdateCategoryInput) {
    const { name, parentId, description } = input;

    // 1. Verify category exists
    const category = await prisma.productCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new AppError('Category not found', HttpCode.NOT_FOUND);
    }

    const dataToUpdate: any = {};

    // 2. Prevent cyclic relation
    if (parentId !== undefined) {
      if (parentId === id) {
        throw new AppError('A category cannot be its own parent.', HttpCode.BAD_REQUEST);
      }
      
      if (parentId !== null) {
        const parent = await prisma.productCategory.findUnique({
          where: { id: parentId },
        });
        if (!parent) {
          throw new AppError('Parent category not found', HttpCode.NOT_FOUND);
        }
      }
      dataToUpdate.parentId = parentId;
    }

    // 3. Handle name and slug changes
    if (name) {
      const slug = slugify(name);
      if (slug !== category.slug) {
        const existing = await prisma.productCategory.findUnique({
          where: { slug },
        });
        if (existing) {
          throw new AppError(`Category slug '${slug}' already exists.`, HttpCode.CONFLICT);
        }
        dataToUpdate.name = name;
        dataToUpdate.slug = slug;
      } else {
        dataToUpdate.name = name;
      }
    }

    if (description !== undefined) {
      dataToUpdate.description = description;
    }

    return prisma.productCategory.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  /**
   * Delete category
   */
  static async delete(id: string) {
    const category = await prisma.productCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new AppError('Category not found', HttpCode.NOT_FOUND);
    }

    return prisma.productCategory.delete({
      where: { id },
    });
  }
}
