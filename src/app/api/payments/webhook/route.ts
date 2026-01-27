import { NextRequest, NextResponse } from 'next/server';
import { handlePaymentWebhook } from '@/lib/services/payment.service';
import { successResponse, errorResponse } from '@/lib/utils/response.util';
import { handleError } from '@/lib/utils/error.util';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, payload } = body;

    if (!event || !payload) {
      return NextResponse.json(
        errorResponse('Event and payload are required', null, 400),
        { status: 400 },
      );
    }

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_KEY_SECRET ||
      '';
    const razorpaySignature = request.headers.get('x-razorpay-signature');

    if (razorpaySignature && webhookSecret) {
      const text = JSON.stringify(body);
      const generatedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(text)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json(
          errorResponse('Invalid webhook signature', null, 401),
          {
            status: 401,
          },
        );
      }
    }

    const razorpayOrderId =
      payload.order?.entity?.id || payload.payment?.entity?.order_id;
    const paymentId = payload.payment?.entity?.id;

    if (!razorpayOrderId || !paymentId) {
      return NextResponse.json(
        errorResponse('Order ID and payment ID are required', null, 400),
        { status: 400 },
      );
    }

    await handlePaymentWebhook(razorpayOrderId, paymentId, event);
    return NextResponse.json(
      successResponse('Webhook processed successfully', null),
    );
  } catch (error) {
    const { message, statusCode, error: errData } = handleError(error);
    return NextResponse.json(errorResponse(message, errData, statusCode), {
      status: statusCode,
    });
  }
}
