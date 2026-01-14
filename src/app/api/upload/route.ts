import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/services/cloudinary.service';
import { handleError } from '@/lib/utils/error.util'; // Assuming this exists or will use generic error handling

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadImage(buffer);

        return NextResponse.json({ url });
    } catch (error) {
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 }); // Simple fallback if handleError missing
    }
}
