import { z } from 'zod';

const multiLangField = z.object({
  en: z.string().min(1, 'English name is required'),
  hi: z.string().optional(),
  ur: z.string().optional(),
});

export const branchSchema = z.object({
  name: z.string().min(1, 'Branch name is required').trim(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only')
    .trim(),
  address: z.string().min(1, 'Address is required'),
  area: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().min(10, 'Valid phone number is required'),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  googleMapsUrl: z.string().url().optional().or(z.literal('')),
  description: z
    .object({ en: z.string().optional(), hi: z.string().optional(), ur: z.string().optional() })
    .optional(),
  facilities: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
});

export const courseSchema = z.object({
  name: multiLangField,
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .trim(),
  divisionId: z.string().min(1, 'Division is required'),
  category: z.string().optional(),
  description: z
    .object({ en: z.string().optional(), hi: z.string().optional(), ur: z.string().optional() })
    .optional(),
  shortDescription: z
    .object({ en: z.string().optional(), hi: z.string().optional(), ur: z.string().optional() })
    .optional(),
  image: z.string().optional(),
  duration: z.string().optional(),
  fee: z.number().min(0).optional(),
  ageEligibility: z.string().optional(),
  classEligibility: z.array(z.string()).optional(),
  branchIds: z.array(z.string()).optional(),
  teacherIds: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
});

export const classSchema = z.object({
  name: multiLangField,
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .trim(),
  numericValue: z.number().int().optional(),
  divisionId: z.string().min(1, 'Division is required'),
  description: z.string().optional(),
  fee: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  displayOrder: z.number().int().min(0).default(0),
});

export const subjectSchema = z.object({
  name: multiLangField,
  code: z.string().optional(),
  divisionId: z.string().min(1, 'Division is required'),
  classIds: z.array(z.string()).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type BranchInput = z.infer<typeof branchSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type ClassInput = z.infer<typeof classSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;

