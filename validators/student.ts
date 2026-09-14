import { z } from 'zod';

export const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  photo: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z
    .object({
      line1: z.string().optional(),
      area: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  primaryBranchId: z.string().min(1, 'Branch is required'),
  admissionDate: z.string().optional(),
  academicYearId: z.string().min(1, 'Academic year is required'),
  status: z.enum(['active', 'inactive', 'transferred', 'graduated', 'dropped']).default('active'),
  notes: z.string().optional(),
});

export const enrollmentSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  divisionId: z.string().min(1, 'Division is required'),
  branchId: z.string().min(1, 'Branch is required'),
  academicYearId: z.string().min(1, 'Academic year is required'),
  courseId: z.string().optional(),
  classId: z.string().optional(),
  subjectIds: z.array(z.string()).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  feePlanId: z.string().optional(),
  notes: z.string().optional(),
});

export const admissionApplicationSchema = z.object({
  applicantName: z.string().min(1, 'Name is required').trim(),
  fatherName: z.string().optional(),
  guardianPhone: z.string().min(10, 'Valid phone number is required'),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  divisionId: z.string().optional(),
  classId: z.string().optional(),
  courseIds: z.array(z.string()).optional(),
  preferredBranchId: z.string().optional(),
  preferredTiming: z.string().optional(),
  message: z.string().max(500).optional(),
});

export const enquirySchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  phone: z.string().min(10, 'Valid phone number is required').trim(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  interestedDivision: z.string().optional(),
  interestedClass: z.string().optional(),
  interestedCourse: z.string().optional(),
  branchId: z.string().optional(),
  message: z.string().max(1000).optional(),
});

export type StudentInput = z.infer<typeof studentSchema>;
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
export type AdmissionApplicationInput = z.infer<typeof admissionApplicationSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;

