import { prisma } from '../config/db';
import { AppError, HttpCode } from '../utils/errors';
import { z } from 'zod';
import { createOrUpdateSEOSchema } from '../utils/validation';

type SEOInput = z.infer<typeof createOrUpdateSEOSchema>['body'];

export class SEOService {
  /**
   * Get SEO Metadata for a page
   */
  static async getMetadata(pageType: string, pageId: string | null) {
    const targetPageId = pageId || 'STATIC_PAGE';

    const seo = await prisma.sEOMetadata.findUnique({
      where: {
        pageType_pageId: {
          pageType,
          pageId: targetPageId,
        },
      },
    });

    if (!seo) {
      throw new AppError('SEO metadata not found for this page target', HttpCode.NOT_FOUND);
    }

    return seo;
  }

  /**
   * Upsert (Create or Update) SEO Metadata
   */
  static async upsert(input: SEOInput) {
    const { pageType, pageId, metaTitle, metaDescription, canonicalUrl } = input;
    const targetPageId = pageId || 'STATIC_PAGE'; // Standardize fallback to avoid true DB nulls in compound unique constraints

    // 1. Verify entity exists if it is not a STATIC type
    if (pageType !== 'STATIC' && pageId) {
      let exists = false;

      switch (pageType) {
        case 'PRODUCT':
          exists = !!(await prisma.product.findUnique({ where: { id: pageId } }));
          break;
        case 'CATEGORY':
          exists = !!(await prisma.productCategory.findUnique({ where: { id: pageId } }));
          break;
        case 'MATERIAL':
          exists = !!(await prisma.material.findUnique({ where: { id: pageId } }));
          break;
        case 'USE_CASE':
          exists = !!(await prisma.useCase.findUnique({ where: { id: pageId } }));
          break;
        case 'ISSUE':
          exists = !!(await prisma.issue.findUnique({ where: { id: pageId } }));
          break;
        case 'BLOG':
          exists = !!(await prisma.blogPost.findUnique({ where: { id: pageId } }));
          break;
      }

      if (!exists) {
        throw new AppError(`Target resource of type ${pageType} with ID '${pageId}' does not exist.`, HttpCode.NOT_FOUND);
      }
    }

    // 2. Perform atomic upsert
    return prisma.sEOMetadata.upsert({
      where: {
        pageType_pageId: {
          pageType,
          pageId: targetPageId,
        },
      },
      update: {
        metaTitle,
        metaDescription,
        canonicalUrl: canonicalUrl || null,
      },
      create: {
        pageType,
        pageId: targetPageId,
        metaTitle,
        metaDescription,
        canonicalUrl: canonicalUrl || null,
      },
    });
  }

  /**
   * Delete SEO metadata
   */
  static async delete(pageType: string, pageId: string | null) {
    const targetPageId = pageId || 'STATIC_PAGE';

    const seo = await prisma.sEOMetadata.findUnique({
      where: {
        pageType_pageId: {
          pageType,
          pageId: targetPageId,
        },
      },
    });

    if (!seo) {
      throw new AppError('SEO metadata not found', HttpCode.NOT_FOUND);
    }

    return prisma.sEOMetadata.delete({
      where: {
        pageType_pageId: {
          pageType,
          pageId: targetPageId,
        },
      },
    });
  }
}
