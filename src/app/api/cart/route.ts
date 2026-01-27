import { NextRequest, NextResponse } from 'next/server';
import {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '@/lib/services/cart.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { ROLES } from '@/lib/constants/roles';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, [
      ROLES.CUSTOMER,
      ROLES.ADMIN,
    ]);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const cart = await getCartByUserId(authResult.user.userId);
    return NextResponse.json(
      successResponse('Cart fetched successfully', cart),
    );
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, [
      ROLES.CUSTOMER,
      ROLES.ADMIN,
    ]);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { supplementId, quantity } = body;

    if (!supplementId || !quantity) {
      return NextResponse.json(
        errorResponse('Supplement ID and quantity are required', null, 400),
        { status: 400 },
      );
    }

    const cart = await addToCart(
      authResult.user.userId,
      supplementId,
      quantity,
    );
    return NextResponse.json(successResponse('Item added to cart', cart, 201), {
      status: 201,
    });
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, [
      ROLES.CUSTOMER,
      ROLES.ADMIN,
    ]);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { supplementId, quantity } = body;

    if (!supplementId || quantity === undefined) {
      return NextResponse.json(
        errorResponse('Supplement ID and quantity are required', null, 400),
        { status: 400 },
      );
    }

    const cart = await updateCartItem(
      authResult.user.userId,
      supplementId,
      quantity,
    );
    return NextResponse.json(successResponse('Cart item updated', cart));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, [
      ROLES.CUSTOMER,
      ROLES.ADMIN,
    ]);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const supplementId = searchParams.get('supplementId');
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll) {
      const cart = await clearCart(authResult.user.userId);
      return NextResponse.json(successResponse('Cart cleared', cart));
    }

    if (!supplementId) {
      return NextResponse.json(
        errorResponse(
          'Supplement ID is required or use clearAll=true',
          null,
          400,
        ),
        { status: 400 },
      );
    }

    const cart = await removeFromCart(authResult.user.userId, supplementId);
    return NextResponse.json(successResponse('Item removed from cart', cart));
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}
