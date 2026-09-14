import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import AdmissionApplication from '@/models/AdmissionApplication';
import { admissionApplicationSchema } from '@/validators/student';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status') ?? undefined;
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 20);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (status) filter.status = status;

    const [applications, total] = await Promise.all([
      AdmissionApplication.find(filter)
        .populate('preferredBranchId', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AdmissionApplication.countDocuments(filter),
    ]);

    return NextResponse.json({
      applications: JSON.parse(JSON.stringify(applications)),
      total, page, limit, totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// Public admission application submission
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

    return NextResponse.json({
      success: true,
      applicationId: application._id.toString(),
      message: 'Application submitted successfully. We will review it shortly.',
    }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
