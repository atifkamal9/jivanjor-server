import { prisma } from '../config/db';
import { AppError, HttpCode } from '../utils/errors';
import { slugify } from '../utils/slugify';
import { z } from 'zod';
import { createBlogSchema, updateBlogSchema } from '../utils/validation';

type CreateBlogInput = z.infer<typeof createBlogSchema>['body'];
type UpdateBlogInput = z.infer<typeof updateBlogSchema>['body'];

export interface BlogQueryParams {
  category?: string;
  tag?: string;
  author?: string;
  search?: string;
  page?: string;
  limit?: string;
}

export class BlogService {
  /**
   * Get all blogs with filters and pagination
   */
  static async getAll(params: BlogQueryParams) {
    const { category, tag, author, search, page = '1', limit = '10' } = params;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};

    if (category) {
      whereClause.category = category;
    }

    if (author) {
      whereClause.author = author;
    }

    if (tag) {
      // In Prisma, we can search if a JSON field contains a value
      whereClause.tags = {
        array_contains: tag,
      };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [total, blogs] = await prisma.$transaction([
      prisma.blogPost.count({ where: whereClause }),
      prisma.blogPost.findMany({
        where: whereClause,
        orderBy: { publishDate: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return {
      blogs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get blog by ID or Slug
   */
  static async getByIdOrSlug(idOrSlug: string) {
    const isUuid = idOrSlug.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);

    const blog = await prisma.blogPost.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
    });

    if (!blog) {
      throw new AppError('Blog post not found', HttpCode.NOT_FOUND);
    }

    // Fetch SEO metadata if it exists
    const seo = await prisma.sEOMetadata.findUnique({
      where: {
        pageType_pageId: {
          pageType: 'BLOG',
          pageId: blog.id,
        },
      },
    });

    return {
      ...blog,
      seo,
    };
  }

  /**
   * Create blog post
   */
  static async create(input: CreateBlogInput) {
    const { title, content, category, tags, author, publishDate } = input;
    const slug = slugify(title);

    // Validate slug uniqueness
    const existing = await prisma.blogPost.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new AppError(`Blog post slug '${slug}' already exists. Please choose a different title.`, HttpCode.CONFLICT);
    }

    return prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        category,
        tags: tags ? JSON.parse(JSON.stringify(tags)) : null,
        author,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
      },
    });
  }

  /**
   * Update blog post
   */
  static async update(id: string, input: UpdateBlogInput) {
    const { title, content, category, tags, author, publishDate } = input;

    // Verify blog exists
    const blog = await prisma.blogPost.findUnique({
      where: { id },
    });
    if (!blog) {
      throw new AppError('Blog post not found', HttpCode.NOT_FOUND);
    }

    const dataToUpdate: any = {};

    if (title) {
      const slug = slugify(title);
      if (slug !== blog.slug) {
        const existing = await prisma.blogPost.findUnique({
          where: { slug },
        });
        if (existing) {
          throw new AppError(`Blog post slug '${slug}' already exists.`, HttpCode.CONFLICT);
        }
        dataToUpdate.title = title;
        dataToUpdate.slug = slug;
      } else {
        dataToUpdate.title = title;
      }
    }

    if (content) {
      dataToUpdate.content = content;
    }

    if (category) {
      dataToUpdate.category = category;
    }

    if (tags !== undefined) {
      dataToUpdate.tags = tags ? JSON.parse(JSON.stringify(tags)) : null;
    }

    if (author) {
      dataToUpdate.author = author;
    }

    if (publishDate) {
      dataToUpdate.publishDate = new Date(publishDate);
    }

    return prisma.blogPost.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  /**
   * Delete blog post
   */
  static async delete(id: string) {
    const blog = await prisma.blogPost.findUnique({
      where: { id },
    });
    if (!blog) {
      throw new AppError('Blog post not found', HttpCode.NOT_FOUND);
    }

    return prisma.blogPost.delete({
      where: { id },
    });
  }
}
