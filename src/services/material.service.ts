import { prisma } from '../config/db';
import { AppError, HttpCode } from '../utils/errors';
import { z } from 'zod';
import { createMaterialSchema, updateMaterialSchema } from '../utils/validation';

type CreateMaterialInput = z.infer<typeof createMaterialSchema>['body'];
type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>['body'];

export class MaterialService {
  /**
   * Get all materials
   */
  static async getAll() {
    return prisma.material.findMany({
      orderBy: { materialName: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  /**
   * Get material by ID
   */
  static async getById(id: string) {
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!material) {
      throw new AppError('Material not found', HttpCode.NOT_FOUND);
    }

    return material;
  }

  /**
   * Create material
   */
  static async create(input: CreateMaterialInput) {
    return prisma.material.create({
      data: input,
    });
  }

  /**
   * Update material
   */
  static async update(id: string, input: UpdateMaterialInput) {
    const material = await prisma.material.findUnique({
      where: { id },
    });
    if (!material) {
      throw new AppError('Material not found', HttpCode.NOT_FOUND);
    }

    return prisma.material.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Delete material
   */
  static async delete(id: string) {
    const material = await prisma.material.findUnique({
      where: { id },
    });
    if (!material) {
      throw new AppError('Material not found', HttpCode.NOT_FOUND);
    }

    return prisma.material.delete({
      where: { id },
    });
  }
}
