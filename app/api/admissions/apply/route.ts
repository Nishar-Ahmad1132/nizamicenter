import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import AdmissionApplication from '@/models/AdmissionApplication';
import { admissionApplicationSchema } from '@/validators/student';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const parsed = admissionApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const application = await AdmissionApplication.create({
      ...parsed.data,
      status: 'pending',
    });

    return NextResponse.json(
      {
        success: true,
        applicationId: application._id.toString(),
        message: 'Your admission application has been submitted successfully. We will review it shortly.',
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
