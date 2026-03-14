import { NextResponse } from 'next/server';
import { configService } from '@/lib/services/config.service';

export async function GET() {
  try {
    const configs = await configService.getPublicConfigs();
    return NextResponse.json({ success: true, data: configs });
  } catch (error) {
    console.error('API Config Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch config' }, { status: 500 });
  }
}
