import Blog, { IBlog } from '@/lib/models/blog.model';
import connectDB from '@/lib/db/mongodb';
import { PAGE_SIZE_3 } from '@/lib/constants/pagination.constants';
import { handleError, ValidationError, NotFoundError } from '@/lib/utils/error.util';
import { Types } from 'mongoose';

export interface CreateBlogData {
  title: string;
  content: string;
  coverImage?: string;
  author: string;
  tags?: string[];
  readTime?: number;
  isPublished?: boolean;
  slug?: string;
}

export interface UpdateBlogData {
  title?: string;
  content?: string;
  coverImage?: string;
  author?: string;
  tags?: string[];
  readTime?: number;
  isPublished?: boolean;
  slug?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function calculateReadTime(content: string): number {
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).filter((word) => word.length > 0).length;
  const readTime = Math.ceil(wordCount / 200);
  return Math.max(1, readTime);
}

export async function createBlog(data: CreateBlogData): Promise<IBlog> {
  await connectDB();
  try {
    if (!data.title || !data.content || !data.author) {
      throw new ValidationError('Title, content, and author are required');
    }

    const slug = data.slug || generateSlug(data.title);

    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      throw new ValidationError('A blog with this slug already exists');
    }

    const readTime = data.readTime || calculateReadTime(data.content);

    const blog = await Blog.create({
      ...data,
      slug,
      readTime,
    });

    return blog;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getAllBlogs(filter: Record<string, unknown> = {}): Promise<IBlog[]> {
  await connectDB();
  try {
    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    return blogs;
  } catch (error) {
    throw handleError(error);
  }
}

export interface AdminBlogsPaginatedResult {
  blogs: IBlog[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export async function getAllBlogsPaginated(
  options: { page?: number; limit?: number; search?: string } = {},
): Promise<AdminBlogsPaginatedResult> {
  await connectDB();
  try {
    const { page = 1, limit = PAGE_SIZE_3, search } = options;
    const filter: Record<string, unknown> = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/\s+/g, ' '), 'i');
      filter.$or = [{ title: searchRegex }, { author: searchRegex }];
    }

    const skip = (Math.max(1, page) - 1) * limit;
    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      Blog.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const currentPage = Math.min(Math.max(1, page), totalPages);

    return {
      blogs: blogs as IBlog[],
      total,
      totalPages,
      page: currentPage,
      limit,
    };
  } catch (error) {
    throw handleError(error);
  }
}

export async function getPublishedBlogs(tag?: string): Promise<IBlog[]> {
  await connectDB();
  try {
    const filter: Record<string, unknown> = { isPublished: true };
    if (tag) {
      filter.tags = { $in: [tag] };
    }
    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    return blogs;
  } catch (error) {
    throw handleError(error);
  }
}

export interface PaginatedBlogsResult {
  blogs: IBlog[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  allTags: string[];
}

export async function getPublishedBlogsPaginated(
  options: { tag?: string; search?: string; page?: number; limit?: number } = {},
): Promise<PaginatedBlogsResult> {
  await connectDB();
  try {
    const { tag, search, page = 1, limit = PAGE_SIZE_3 } = options;
    const filter: Record<string, unknown> = { isPublished: true };

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim().replace(/\s+/g, ' '), 'i');
      filter.$or = [{ title: searchRegex }, { author: searchRegex }, { content: searchRegex }];
    }

    const skip = (Math.max(1, page) - 1) * limit;
    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      Blog.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const currentPage = Math.min(Math.max(1, page), totalPages);

    const allTagsResult = await Blog.distinct('tags', { isPublished: true });
    const allTags = (allTagsResult as string[]).filter(Boolean).sort();

    return {
      blogs: blogs as IBlog[],
      total,
      totalPages: totalPages,
      page: currentPage,
      limit,
      allTags,
    };
  } catch (error) {
    throw handleError(error);
  }
}

export async function getBlogById(id: string): Promise<IBlog> {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid Blog ID');
    }
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }
    return blog;
  } catch (error) {
    throw handleError(error);
  }
}

export async function getBlogBySlug(slug: string): Promise<IBlog> {
  await connectDB();
  try {
    const blog = await Blog.findOne({ slug, isPublished: true });
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }
    return blog;
  } catch (error) {
    throw handleError(error);
  }
}

export async function updateBlog(id: string, data: UpdateBlogData): Promise<IBlog> {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid Blog ID');
    }

    if (data.slug) {
      const existingBlog = await Blog.findOne({ slug: data.slug, _id: { $ne: id } });
      if (existingBlog) {
        throw new ValidationError('A blog with this slug already exists');
      }
    }

    const updateData: UpdateBlogData = { ...data };

    if (data.content && !data.readTime) {
      updateData.readTime = calculateReadTime(data.content);
    }

    const blog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      throw new NotFoundError('Blog not found');
    }

    return blog;
  } catch (error) {
    throw handleError(error);
  }
}

export async function deleteBlog(id: string): Promise<{ message: string }> {
  await connectDB();
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw new ValidationError('Invalid Blog ID');
    }
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }
    return { message: 'Blog deleted successfully' };
  } catch (error) {
    throw handleError(error);
  }
}

export async function getBlogsByTag(tag: string): Promise<IBlog[]> {
  await connectDB();
  try {
    const blogs = await Blog.find({
      tags: { $in: [tag] },
      isPublished: true,
    }).sort({ createdAt: -1 });
    return blogs;
  } catch (error) {
    throw handleError(error);
  }
}
