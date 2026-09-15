import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Enquiry from '@/models/Enquiry';
import '@/models/Branch';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { phone, email } = body;

    if (!phone && !email) {
      return NextResponse.json(
        { error: 'Please enter your phone number or email address to track your enquiry.' },
        { status: 400 }
      );
    }

    const query: Record<string, any> = {};
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      let tenDigits = '';
      if (cleanPhone.length === 10) {
        tenDigits = cleanPhone;
      } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
        tenDigits = cleanPhone.slice(1);
      } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
        tenDigits = cleanPhone.slice(2);
      } else {
        return NextResponse.json(
          { error: 'Please enter a valid 10-digit registered mobile number to track your enquiry.' },
          { status: 400 }
        );
      }

      // Exact number matching: matches exact 10 digits with optional +91/91/0 prefix and hyphens/spaces
      const exactPattern = new RegExp('^(?:\\+?91|0)?[\\s-]*' + tenDigits.split('').join('[\\s-]*') + '$');
      query.$or = [
        { phone: exactPattern },
        { whatsapp: exactPattern },
      ];
    } else if (email) {
      const cleanEmail = email.trim().toLowerCase();
      query.email = new RegExp(`^${cleanEmail}$`, 'i');
    }

    const enquiries = await Enquiry.find(query)
      .populate('branchId', 'name address phone')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    if (!enquiries || enquiries.length === 0) {
      return NextResponse.json(
        {
          success: true,
          found: false,
          message: 'No enquiries found matching this contact information. Please submit an enquiry first.',
          enquiries: [],
        }
      );
    }

    const sanitized = enquiries.map((e: any) => ({
      id: e._id.toString(),
      name: e.name,
      interestedDivision: e.interestedDivision,
      interestedClass: e.interestedClass,
      interestedCourse: e.interestedCourse,
      branchName: e.branchId?.name || 'Main Campus (Kokan Nagar)',
      branchPhone: e.branchId?.phone || '8779282185',
      message: e.message,
      status: e.status,
      adminResponse: e.adminResponse || null,
      respondedAt: e.respondedAt || null,
      createdAt: e.createdAt,
      lastContactedAt: e.lastContactedAt || null,
    }));

    return NextResponse.json({
      success: true,
      found: true,
      count: sanitized.length,
      enquiries: sanitized,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
