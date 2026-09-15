import { requireStudent } from '@/lib/auth/session';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import Enquiry from '@/models/Enquiry';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Send,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import StudentSupportClient from './StudentSupportClient';

export default async function StudentSupportPage() {
  const user = await requireStudent();
  await dbConnect();

  const student = await Student.findOne({
    $or: [
      { userId: user.id },
      { studentId: new RegExp(`^${user.username}$`, 'i') },
    ],
  }).lean();

  const phoneQuery = student?.phone || student?.whatsapp || student?.guardianPhone;
  const emailQuery = student?.email || user.email;

  const queries: any[] = [];
  if (phoneQuery) {
    const digits = phoneQuery.replace(/\D/g, '').slice(-10);
    queries.push({ phone: new RegExp(digits) });
    queries.push({ whatsapp: new RegExp(digits) });
  }
  if (emailQuery) {
    queries.push({ email: emailQuery.toLowerCase() });
  }

  let enquiries: any[] = [];
  if (queries.length > 0) {
    enquiries = await Enquiry.find({ $or: queries })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
  }

  const items = JSON.parse(JSON.stringify(enquiries));

  return (
    <StudentSupportClient
      studentName={student ? `${student.firstName} ${student.lastName && student.lastName !== '-' ? student.lastName : ''}`.trim() : user.username}
      studentPhone={student?.phone || ''}
      studentEmail={student?.email || user.email || ''}
      initialEnquiries={items}
    />
  );
}
