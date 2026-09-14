import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Enquiry from '@/models/Enquiry';
import { enquirySchema } from '@/validators/student';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const enquiry = await Enquiry.create({
      ...parsed.data,
      status: 'new',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for reaching out! Our team will contact you shortly.',
        enquiryId: enquiry._id.toString(),
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
