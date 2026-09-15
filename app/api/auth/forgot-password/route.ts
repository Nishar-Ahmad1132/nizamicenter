import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import bcrypt from 'bcryptjs';

function normalizePhone(phoneStr?: string): string {
  if (!phoneStr) return '';
  return phoneStr.replace(/\D/g, '');
}

function maskPhoneNumber(phoneStr?: string): string {
  if (!phoneStr) return '';
  const digits = normalizePhone(phoneStr);
  if (digits.length < 4) return '***' + digits;
  const lastFour = digits.slice(-4);
  return `••••••${lastFour}`;
}

function maskEmailAddress(emailStr?: string): string {
  if (!emailStr || !emailStr.includes('@')) return '';
  const [name, domain] = emailStr.split('@');
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  return `${name.slice(0, 2)}••••@${domain}`;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { action, identifier, verificationPhone, verificationEmail, newPassword } = body;

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { error: 'Please enter your Student ID, Username, or registered Email.' },
        { status: 400 }
      );
    }

    const cleanId = identifier.trim();

    // 1. Locate student and/or user
    // Search Student collection first (case-insensitive studentId or email)
    let student = await Student.findOne({
      $or: [
        { studentId: new RegExp(`^${cleanId}$`, 'i') },
        { email: cleanId.toLowerCase() },
      ],
      isActive: true,
    }).lean();

    let user = null;
    if (student?.userId) {
      user = await User.findById(student.userId);
    }

    // If not found via student, search User collection directly
    if (!user) {
      user = await User.findOne({
        $or: [
          { username: cleanId.toLowerCase() },
          { email: cleanId.toLowerCase() },
        ],
        isActive: true,
      });

      // If user found and no student yet, find linked student
      if (user && !student) {
        student = await Student.findOne({ userId: user._id, isActive: true }).lean();
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: `No active account found for "${cleanId}". Please check your Student ID / Username or contact administration.` },
        { status: 404 }
      );
    }

    const studentName = student
      ? `${student.firstName} ${student.lastName && student.lastName !== '-' ? student.lastName : ''}`.trim()
      : user.username;

    const studentCode = student?.studentId || user.username.toUpperCase();
    const registeredPhone = student?.phone || student?.whatsapp || student?.guardianPhone || '';
    const registeredEmail = user.email || student?.email || '';

    // ACTION: LOOKUP (Verify account exists and return masked verification options)
    if (action === 'lookup') {
      return NextResponse.json({
        success: true,
        account: {
          studentId: studentCode,
          name: studentName,
          role: user.role,
          hasPhone: Boolean(registeredPhone),
          maskedPhone: maskPhoneNumber(registeredPhone),
          hasEmail: Boolean(registeredEmail),
          maskedEmail: maskEmailAddress(registeredEmail),
        },
      });
    }

    // ACTION: RESET (Verify contact details and update password)
    if (action === 'reset') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      let isVerified = false;
      let verificationMethod = '';

      // Verify via Phone / WhatsApp
      if (verificationPhone) {
        const inputDigits = normalizePhone(verificationPhone);
        const studentDigits = normalizePhone(registeredPhone);
        const altDigits = normalizePhone(student?.guardianPhone || '');

        // Match if last 8-10 digits align
        if (
          (inputDigits.length >= 6 && studentDigits.endsWith(inputDigits)) ||
          (studentDigits.length >= 6 && inputDigits.endsWith(studentDigits)) ||
          (altDigits.length >= 6 && altDigits.endsWith(inputDigits)) ||
          inputDigits === studentDigits
        ) {
          isVerified = true;
          verificationMethod = `Phone verification (${maskPhoneNumber(registeredPhone)})`;
        }
      }

      // Verify via Email if phone didn't verify or email provided
      if (!isVerified && verificationEmail) {
        const inputEmail = verificationEmail.trim().toLowerCase();
        if (
          (registeredEmail && inputEmail === registeredEmail.toLowerCase()) ||
          (student?.email && inputEmail === student.email.toLowerCase())
        ) {
          isVerified = true;
          verificationMethod = `Email verification (${maskEmailAddress(registeredEmail)})`;
        }
      }

      if (!isVerified) {
        return NextResponse.json(
          {
            error:
              'Verification failed. The contact phone number or email entered does not match our registered records for this student.',
          },
          { status: 400 }
        );
      }

      // Hash and update password
      const passwordHash = await bcrypt.hash(newPassword, 10);
      user.passwordHash = passwordHash;
      user.mustChangePassword = false;
      user.isActive = true;
      user.deletedAt = undefined;
      await user.save();

      // Log audit
      try {
        await AuditLog.create({
          userId: user._id,
          userRole: user.role,
          action: 'UPDATE',
          entity: 'User',
          entityId: user._id.toString(),
          description: `Password reset successfully via self-service ${verificationMethod} for ${studentCode} (${studentName})`,
        });
      } catch (logErr) {
        console.error('Failed to log audit:', logErr);
      }

      return NextResponse.json({
        success: true,
        message: `Password has been reset successfully for ${studentCode}. You can now sign in with your new password.`,
        username: user.username,
      });
    }

    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
