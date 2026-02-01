import { NextRequest, NextResponse } from 'next/server';
import { createBlog, getPublishedBlogsPaginated, getAllBlogsPaginated } from '@/lib/services/blog.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { ROLES } from '@/lib/constants/roles';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE_ADMIN, MAX_PAGE_SIZE_PUBLIC } from '@/lib/constants/pagination.constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const adminView = searchParams.get('admin') === 'true';

    if (adminView) {
      const authResult = await requireAuth(request, [ROLES.ADMIN]);
      if (authResult instanceof NextResponse) {
        return authResult;
      }
      const adminPage = searchParams.get('page');
      const adminLimit = searchParams.get('limit');
      const adminSearch = searchParams.get('search') || undefined;
      const pageNum = adminPage ? Math.max(1, parseInt(adminPage, 10) || 1) : 1;
      const limitNum = adminLimit
        ? Math.min(MAX_PAGE_SIZE_ADMIN, Math.max(1, parseInt(adminLimit, 10) || DEFAULT_PAGE_SIZE))
        : DEFAULT_PAGE_SIZE;
      const result = await getAllBlogsPaginated({
        page: pageNum,
        limit: limitNum,
        search: adminSearch,
      });
      return NextResponse.json(
        successResponse('Blogs fetched successfully', {
          blogs: result.blogs,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        }),
      );
    }

    const pageNum = page ? Math.max(1, parseInt(page, 10) || 1) : 1;
    const limitNum = limit
      ? Math.min(MAX_PAGE_SIZE_PUBLIC, Math.max(1, parseInt(limit, 10) || DEFAULT_PAGE_SIZE))
      : DEFAULT_PAGE_SIZE;

    const result = await getPublishedBlogsPaginated({
      tag,
      search,
      page: pageNum,
      limit: limitNum,
    });

    return NextResponse.json(
      successResponse('Blogs fetched successfully', {
        blogs: result.blogs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        allTags: result.allTags,
      }),
    );
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req, [ROLES.ADMIN]);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(errorResponse('Invalid request body', null, 400), { status: 400 });
    }

    const blog = await createBlog(body);
    return NextResponse.json(successResponse('Blog created successfully', blog, 201), { status: 201 });
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}
