import { NextRequest, NextResponse } from "next/server";
import { createOrder, getUserOrders } from "@/lib/services/order.service";
import { successResponse, errorResponse } from "@/lib/utils/response.util";
import { handleError } from "@/lib/utils/error.util";
import { requireAuth } from "@/lib/middleware/auth.middleware";
import { ROLES } from "@/lib/constants/roles";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, [
      ROLES.CUSTOMER,
      ROLES.ADMIN,
    ]);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const orders = await getUserOrders(authResult.user.userId);
    return NextResponse.json(
      successResponse("Orders fetched successfully", orders),
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
    const { shippingAddress } = body;

    if (!shippingAddress || typeof shippingAddress !== "object") {
      return NextResponse.json(
        errorResponse("Shipping address is required", null, 400),
        { status: 400 },
      );
    }

    const requiredFields = [
      "name",
      "phone",
      "addressLine1",
      "city",
      "state",
      "zipCode",
      "country",
    ];
    for (const field of requiredFields) {
      if (!shippingAddress[field]) {
        return NextResponse.json(
          errorResponse(`Shipping address ${field} is required`, null, 400),
          { status: 400 },
        );
      }
    }

    const order = await createOrder(authResult.user.userId, shippingAddress);
    return NextResponse.json(
      successResponse("Order created successfully", order, 201),
      {
        status: 201,
      },
    );
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}
