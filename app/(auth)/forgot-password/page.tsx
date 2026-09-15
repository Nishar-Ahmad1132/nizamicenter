'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  KeyRound, ArrowLeft, CheckCircle2, AlertCircle, Loader2,
  GraduationCap, Phone, Mail, Eye, EyeOff, ShieldCheck, MessageCircle
} from 'lucide-react';

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIdentifier = searchParams.get('identifier') || '';

  const [step, setStep] = useState<'identify' | 'verify' | 'success'>('identify');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [account, setAccount] = useState<{
    studentId: string;
    name: string;
    role: string;
    hasPhone: boolean;
    maskedPhone: string;
    hasEmail: boolean;
    maskedEmail: string;
  } | null>(null);

  // Verification & New Password State
  const [verifyMode, setVerifyMode] = useState<'phone' | 'email'>('phone');
  const [verificationPhone, setVerificationPhone] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-trigger lookup if identifier was passed in URL
  useEffect(() => {
    if (initialIdentifier && step === 'identify') {
      handleLookup(initialIdentifier);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIdentifier]);

  async function handleLookup(idToLookup?: string) {
    const targetId = (idToLookup || identifier).trim();
    if (!targetId) {
      setError('Please enter your Student ID, Username, or registered Email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'lookup', identifier: targetId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Account not found');
      }

      setAccount(data.account);
      // Default to phone if available, else email
      if (data.account.hasPhone) setVerifyMode('phone');
      else if (data.account.hasEmail) setVerifyMode('email');

      setStep('verify');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (verifyMode === 'phone' && !verificationPhone) {
      setError('Please enter your registered phone number for verification.');
      return;
    }

    if (verifyMode === 'email' && !verificationEmail) {
      setError('Please enter your registered email address for verification.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          identifier: account?.studentId || identifier,
          verificationPhone: verifyMode === 'phone' ? verificationPhone : undefined,
          verificationEmail: verifyMode === 'email' ? verificationEmail : undefined,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password reset failed');
      }

      setSuccessMsg(data.message || 'Password reset successfully!');
      setStep('success');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-800 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-900/10">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Nizami Islamic Center</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">& Nizami Education</p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/80 p-6 sm:p-8">
          {/* STEP 1: IDENTIFY */}
          {step === 'identify' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Forgot Password?</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your Student ID (e.g. <span className="font-mono text-emerald-800 font-semibold">NIC-2026-0002</span> or <span className="font-mono text-blue-800 font-semibold">NE-2026-0006</span>), username, or registered email.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLookup();
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="identifier" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Student ID / Username / Email *
                  </label>
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. NIC-2026-0002 or student email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 font-medium text-gray-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !identifier.trim()}
                  className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  {loading ? 'Finding Account...' : 'Continue to Password Recovery'}
                </button>
              </form>

              <div className="pt-2 text-center border-t border-gray-100">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-emerald-800 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2: VERIFY IDENTITY & SET NEW PASSWORD */}
          {step === 'verify' && account && (
            <div className="space-y-5">
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Account Found
                </div>
                <h2 className="text-lg font-bold text-gray-900">Verify Identity & Reset</h2>
                <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <p className="font-bold text-gray-900">{account.name}</p>
                  <p className="font-mono text-emerald-800 font-semibold mt-0.5">Student ID: {account.studentId}</p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Verification Mode Selector if both are available */}
              {account.hasPhone && account.hasEmail && (
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setVerifyMode('phone')}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                      verifyMode === 'phone' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" /> Via Phone ({account.maskedPhone})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyMode('email')}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                      verifyMode === 'email' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" /> Via Email ({account.maskedEmail})
                  </button>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                {/* Phone verification input */}
                {verifyMode === 'phone' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Registered Contact Phone / WhatsApp Number *
                    </label>
                    <p className="text-[11px] text-gray-500 mb-1.5">
                      Enter the phone number ending in <strong className="text-emerald-800">{account.maskedPhone}</strong>
                    </p>
                    <input
                      type="text"
                      required
                      value={verificationPhone}
                      onChange={(e) => setVerificationPhone(e.target.value)}
                      placeholder="e.g. 1234567899"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 font-mono"
                    />
                  </div>
                )}

                {/* Email verification input */}
                {verifyMode === 'email' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Registered Email Address *
                    </label>
                    <p className="text-[11px] text-gray-500 mb-1.5">
                      Confirm the email address linked to your account ({account.maskedEmail})
                    </p>
                    <input
                      type="email"
                      required
                      value={verificationEmail}
                      onChange={(e) => setVerificationEmail(e.target.value)}
                      placeholder="Enter registered email"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
                    />
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    New Password (minimum 6 characters) *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {loading ? 'Resetting Password...' : 'Confirm & Reset Password'}
                </button>
              </form>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setStep('identify');
                    setError(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Different Account?
                </button>
                <Link href="/login" className="text-emerald-800 hover:underline font-medium">
                  Cancel
                </Link>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">Password Reset Successful!</h2>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  {successMsg || 'Your account password has been updated securely. You can now sign in immediately.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const redirectTarget = `/login?username=${encodeURIComponent(account?.studentId || identifier)}`;
                    router.push(redirectTarget);
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Proceed to Sign In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Office / WhatsApp Support Footer */}
        <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
          <p>Still unable to access your account?</p>
          <a
            href="https://wa.me/919876543210?text=Assalam%20o%20Alaikum,%20I%20need%20help%20recovering%20my%20Nizami%20student%20account%20password."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline font-semibold"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            Contact Campus Counseling Desk via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
