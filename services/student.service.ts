import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import WebsiteSetting from '@/models/WebsiteSetting';
import AuditLog from '@/models/AuditLog';
import bcrypt from 'bcryptjs';
import type { StudentInput } from '@/validators/student';
import type { SessionUser } from '@/lib/auth/session';

// Generate next student ID for given division code
async function generateStudentId(divisionCode: string): Promise<string> {
  const year = new Date().getFullYear();
  const code = divisionCode.toUpperCase();
  const prefix = `${code}-${year}-`;

  const lastStudent = await Student.findOne(
    { studentId: new RegExp(`^${prefix}`) },
    { studentId: 1 }
  )
    .sort({ studentId: -1 })
    .lean();

  let sequence = 1;
  if (lastStudent?.studentId) {
    const parts = lastStudent.studentId.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      sequence = lastNum + 1;
    }
  }

  const counterKey = `student_id_counter_${code}_${year}`;
  await WebsiteSetting.findOneAndUpdate(
    { key: counterKey },
    { $set: { value: String(sequence) } },
    { upsert: true }
  );

  return `${prefix}${String(sequence).padStart(4, '0')}`;
}

// Generate receipt number
export async function generateReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `REC-${year}-`;

  const Payment = (await import('@/models/Payment')).default;
  const lastPayment = await Payment.findOne(
    { receiptNumber: new RegExp(`^${prefix}`) },
    { receiptNumber: 1 }
  )
    .sort({ receiptNumber: -1 })
    .lean();

  let sequence = 1;
  if (lastPayment?.receiptNumber) {
    const parts = lastPayment.receiptNumber.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      sequence = lastNum + 1;
    }
  }

  const counterKey = `receipt_counter_${year}`;
  await WebsiteSetting.findOneAndUpdate(
    { key: counterKey },
    { $set: { value: String(sequence) } },
    { upsert: true }
  );

  return `${prefix}${String(sequence).padStart(6, '0')}`;
}

export interface CreateStudentResult {
  student: {
    id: string;
    studentId: string;
    firstName: string;
    lastName: string;
  };
  credentials: {
    username: string;
    temporaryPassword: string;
  };
}

/**
 * Manually create a student (admin flow).
 * Creates: User account + Student record
 * Returns temporary password in plaintext (shown once, then hashed).
 */
export async function createStudentManually(
  data: StudentInput,
  divisionCode: string,
  actingUser: SessionUser,
  enrollmentOptions?: {
    courseId?: string;
    classId?: string;
  }
): Promise<CreateStudentResult> {
  await dbConnect();

  const studentId = await generateStudentId(divisionCode);
  const username = studentId.toLowerCase();

  // Generate secure temporary password
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const temporaryPassword = Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');

  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  // Create User account
  const user = await User.create({
    username,
    email: data.email || undefined,
    passwordHash,
    role: 'student',
    isActive: true,
    mustChangePassword: true,
  });

  // Create Student record
  const student = await Student.create({
    userId: user._id,
    studentId,
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    gender: data.gender,
    phone: data.phone,
    whatsapp: data.whatsapp,
    email: data.email,
    address: data.address,
    fatherName: data.fatherName,
    motherName: data.motherName,
    guardianName: data.guardianName,
    guardianPhone: data.guardianPhone,
    primaryBranchId: data.primaryBranchId,
    admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
    academicYearId: data.academicYearId,
    status: 'active',
    notes: data.notes,
  });

  // Create Enrollment if division is found
  const Division = (await import('@/models/Division')).default;
  const division = await Division.findOne({ code: divisionCode.toUpperCase() });
  if (division) {
    await Enrollment.create({
      studentId: student._id,
      divisionId: division._id,
      branchId: data.primaryBranchId,
      academicYearId: data.academicYearId,
      courseId: enrollmentOptions?.courseId || undefined,
      classId: enrollmentOptions?.classId || undefined,
      enrollmentDate: new Date(),
      startDate: new Date(),
      status: 'active',
      isActive: true,
    });
  }

  // Audit log
  await AuditLog.create({
    userId: actingUser.id,
    userRole: actingUser.role,
    action: 'CREATE',
    entity: 'Student',
    entityId: student._id.toString(),
    description: `Created student ${studentId} - ${data.firstName} ${data.lastName}`,
  });

  return {
    student: {
      id: student._id.toString(),
      studentId,
      firstName: data.firstName,
      lastName: data.lastName,
    },
    credentials: {
      username,
      temporaryPassword,
    },
  };
}

/**
 * Convert an admission application to a student account.
 */
export async function convertApplicationToStudent(
  applicationId: string,
  enrollmentData: {
    divisionCode: string;
    divisionId: string;
    branchId: string;
    classId?: string;
    courseId?: string;
    academicYearId: string;
  },
  actingUser: SessionUser
): Promise<CreateStudentResult> {
  await dbConnect();

  const AdmissionApplication = (await import('@/models/AdmissionApplication')).default;
  const Division = (await import('@/models/Division')).default;
  const app = await AdmissionApplication.findById(applicationId);
  if (!app) throw new Error('Application not found');
  if (app.status === 'rejected') throw new Error('Cannot admit a rejected application');

  app.status = 'approved';
  await app.save();

  let divisionId = enrollmentData.divisionId;
  if (!divisionId) {
    const div = await Division.findOne({ code: enrollmentData.divisionCode.toUpperCase() });
    divisionId = div?._id?.toString() || '';
  }

  const studentId = await generateStudentId(enrollmentData.divisionCode);
  const username = studentId.toLowerCase();

  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const temporaryPassword = Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');

  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const user = await User.create({
    username,
    email: app.email || undefined,
    passwordHash,
    role: 'student',
    isActive: true,
    mustChangePassword: true,
  });

  const student = await Student.create({
    userId: user._id,
    studentId,
    firstName: app.applicantName.split(' ')[0] ?? app.applicantName,
    lastName: app.applicantName.split(' ').slice(1).join(' ') || '-',
    dateOfBirth: app.dateOfBirth,
    gender: app.gender,
    email: app.email,
    guardianPhone: app.guardianPhone,
    fatherName: app.fatherName,
    primaryBranchId: enrollmentData.branchId,
    admissionDate: new Date(),
    academicYearId: enrollmentData.academicYearId,
    status: 'active',
  });

  // Create enrollment
  await Enrollment.create({
    studentId: student._id,
    divisionId: divisionId || enrollmentData.divisionId,
    branchId: enrollmentData.branchId,
    academicYearId: enrollmentData.academicYearId,
    classId: enrollmentData.classId,
    courseId: enrollmentData.courseId,
    enrollmentDate: new Date(),
    startDate: new Date(),
    status: 'active',
  });

  // Update application
  await AdmissionApplication.findByIdAndUpdate(applicationId, {
    status: 'converted',
    convertedStudentId: student._id,
  });

  await AuditLog.create({
    userId: actingUser.id,
    userRole: actingUser.role,
    action: 'CONVERT',
    entity: 'AdmissionApplication',
    entityId: applicationId,
    description: `Converted application to student ${studentId}`,
  });

  return {
    student: {
      id: student._id.toString(),
      studentId,
      firstName: student.firstName,
      lastName: student.lastName,
    },
    credentials: { username, temporaryPassword },
  };
}

/**
 * Get students with pagination & filters.
 */
export async function getStudents(params: {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  classId?: string;
  status?: string;
  divisionId?: string;
}) {
  await dbConnect();

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { isActive: true };

  if (params.status) filter.status = params.status;
  if (params.branchId) filter.primaryBranchId = params.branchId;

  if (params.search) {
    const re = new RegExp(params.search, 'i');
    filter.$or = [
      { firstName: re },
      { lastName: re },
      { studentId: re },
      { phone: re },
      { guardianPhone: re },
    ];
  }

  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate('primaryBranchId', 'name')
      .populate('academicYearId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Student.countDocuments(filter),
  ]);

  return { students, total, page, limit, totalPages: Math.ceil(total / limit) };
}
