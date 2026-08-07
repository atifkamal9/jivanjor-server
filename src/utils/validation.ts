import { z } from 'zod';

// ==========================================
// Authentication Schemas
// ==========================================

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'USER']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// ==========================================
// Category Schemas
// ==========================================

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
    parentId: z.string().uuid('Invalid parent category ID').nullable().optional(),
    description: z.string().optional(),
    tagline: z.string().optional().nullable(),
    icon: z.string().optional().nullable(),
    sections: z.union([z.record(z.any()), z.array(z.any())]).nullable().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').optional(),
    parentId: z.string().uuid('Invalid parent category ID').nullable().optional(),
    description: z.string().optional(),
    tagline: z.string().optional().nullable(),
    icon: z.string().optional().nullable(),
  }),
});

// ==========================================
// Material Schemas
// ==========================================

export const createMaterialSchema = z.object({
  body: z.object({
    materialName: z.string().min(2, 'Material name must be at least 2 characters'),
    description: z.string().optional(),
  }),
});

export const updateMaterialSchema = z.object({
  body: z.object({
    materialName: z.string().min(2, 'Material name must be at least 2 characters').optional(),
    description: z.string().optional(),
  }),
});

// ==========================================
// Product Schemas
// ==========================================

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    description: z.string().min(1, 'Description is required'),
    shortDescription: z.string().nullable().optional(),
    short_description: z.string().nullable().optional(),
    categoryId: z.string().min(1, 'Category ID is required'),
    categoryIds: z.array(z.string()).optional(),
    category_ids: z.array(z.string()).optional(),
    materialId: z.string().nullable().optional(),
    metadata: z.record(z.any()).optional(),
    image: z.string().nullable().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters').optional(),
    description: z.string().optional(),
    shortDescription: z.string().nullable().optional(),
    short_description: z.string().nullable().optional(),
    categoryId: z.string().optional(),
    categoryIds: z.array(z.string()).optional(),
    category_ids: z.array(z.string()).optional(),
    materialId: z.string().nullable().optional(),
    metadata: z.record(z.any()).optional(),
    image: z.string().nullable().optional(),
  }),
});

// ==========================================
// Use Case Schemas
// ==========================================

export const createUseCaseSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
  }),
});

export const updateUseCaseSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').optional(),
    description: z.string().min(5, 'Description must be at least 5 characters').optional(),
  }),
});

// ==========================================
// Issue Schemas
// ==========================================

export const createIssueSchema = z.object({
  body: z.object({
    issueTitle: z.string().min(2, 'Issue title must be at least 2 characters'),
    problem: z.string().min(5, 'Problem must be at least 5 characters'),
    solution: z.string().min(5, 'Solution must be at least 5 characters'),
  }),
});

export const updateIssueSchema = z.object({
  body: z.object({
    issueTitle: z.string().min(2, 'Issue title must be at least 2 characters').optional(),
    problem: z.string().min(5, 'Problem must be at least 5 characters').optional(),
    solution: z.string().min(5, 'Solution must be at least 5 characters').optional(),
  }),
});

// ==========================================
// Blog Post Schemas
// ==========================================

export const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    content: z.string().min(10, 'Content must be at least 10 characters'),
    category: z.string().min(2, 'Category must be at least 2 characters'),
    tags: z.array(z.string()).optional(),
    author: z.string().min(2, 'Author must be at least 2 characters'),
    authorDescription: z.string().optional().nullable(),
    author_description: z.string().optional().nullable(),
    authorAvatar: z.string().optional().nullable(),
    author_avatar: z.string().optional().nullable(),
    publishDate: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    tldr: z.string().optional().nullable(),
  }),
});

export const updateBlogSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').optional(),
    content: z.string().min(10, 'Content must be at least 10 characters').optional(),
    category: z.string().min(2, 'Category must be at least 2 characters').optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().min(2, 'Author must be at least 2 characters').optional(),
    authorDescription: z.string().optional().nullable(),
    author_description: z.string().optional().nullable(),
    authorAvatar: z.string().optional().nullable(),
    author_avatar: z.string().optional().nullable(),
    publishDate: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    tldr: z.string().optional().nullable(),
  }),
});

// ==========================================
// SEO Metadata Schemas
// ==========================================

export const createOrUpdateSEOSchema = z.object({
  body: z.object({
    pageType: z.enum(['PRODUCT', 'CATEGORY', 'MATERIAL', 'USE_CASE', 'ISSUE', 'BLOG', 'STATIC']),
    pageId: z.string().nullable().optional(),
    metaTitle: z.string().min(2, 'Meta title must be at least 2 characters'),
    metaDescription: z.string().min(5, 'Meta description must be at least 5 characters'),
    canonicalUrl: z.string().url('Invalid canonical URL format').nullable().optional(),
    image: z.string().nullable().optional(),
  }),
});

// ==========================================
// Page Schemas
// ==========================================

export const createPageSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'),
    description: z.string().optional(),
    activeTemplateId: z.string().uuid('Invalid template ID').nullable().optional(),
    sections: z.union([z.record(z.any()), z.array(z.any())]).nullable().optional(),
  }),
});

export const updatePageSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').optional(),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().optional(),
    activeTemplateId: z.string().uuid('Invalid template ID').nullable().optional(),
    sections: z.union([z.record(z.any()), z.array(z.any())]).nullable().optional(),
  }),
});

// ==========================================
// Page Template Schemas
// ==========================================

export const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    sections: z.union([z.record(z.any()), z.array(z.any())]).describe('Dynamic sections configuration (with text, paragraphs, images, videos)'),
  }),
});

export const updateTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    sections: z.union([z.record(z.any()), z.array(z.any())]).optional(),
  }),
});
