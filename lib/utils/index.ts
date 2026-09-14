import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format Indian Rupee currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date for display
export function formatDate(date: Date | string | null | undefined, fmt = 'dd MMM yyyy'): string {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, fmt);
  } catch {
    return String(date);
  }
}

// Format month for display (YYYY-MM → "June 2026")
export function formatMonth(month: string): string {
  try {
    const [year, m] = month.split('-').map(Number);
    const date = new Date(year, m - 1, 1);
    return format(date, 'MMMM yyyy');
  } catch {
    return month;
  }
}

// Get current academic year month string (YYYY-MM)
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Generate student ID (division-aware)
// Format: NE-2026-0001 or NIC-2026-0001
export function generateStudentId(divisionCode: string, sequence: number, year?: number): string {
  const y = year ?? new Date().getFullYear();
  const seq = String(sequence).padStart(4, '0');
  return `${divisionCode}-${y}-${seq}`;
}

// Generate receipt number
// Format: REC-2026-000001
export function generateReceiptNumber(sequence: number, year?: number): string {
  const y = year ?? new Date().getFullYear();
  const seq = String(sequence).padStart(6, '0');
  return `REC-${y}-${seq}`;
}

// Generate a slug from a string
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Truncate text
export function truncate(text: string, length = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '…';
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Generate WhatsApp link
export function getWhatsAppLink(phone: string, message?: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  const base = `https://wa.me/${cleaned}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

// Generate fee reminder WhatsApp message
export function getFeeReminderMessage(studentName: string, month: string, amount: number): string {
  return `Assalamualaikum, this is a gentle reminder regarding the pending fee of ${formatCurrency(amount)} for ${studentName} for the month of ${formatMonth(month)}. Please clear the dues at your earliest convenience. Thank you.`;
}

// Attendance percentage color
export function getAttendanceColor(percentage: number): string {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 75) return 'text-yellow-600';
  return 'text-red-600';
}

// Calculate attendance percentage
export function calculateAttendancePercentage(present: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

// Serialize MongoDB document (remove __v, convert _id to string)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeDoc<T>(doc: any): T {
  const obj = JSON.parse(JSON.stringify(doc));
  if (obj._id) obj.id = obj._id.toString();
  delete obj.__v;
  return obj as T;
}

// Paginate helper
export function getPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

