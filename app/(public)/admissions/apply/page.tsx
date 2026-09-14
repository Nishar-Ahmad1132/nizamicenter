'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, CheckCircle2, AlertCircle, ArrowLeft, GraduationCap } from 'lucide-react';

export default function AdmissionApplyPage() {
  const [form, setForm] = useState({
    applicantName: '',
    fatherName: '',
    guardianPhone: '',
    whatsapp: '',
    email: '',
    gender: 'male',
    dateOfBirth: '',
    address: '',
    divisionId: '',
    preferredTiming: 'morning',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admissions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: form.applicantName,
          fatherName: form.fatherName || undefined,
          guardianPhone: form.guardianPhone,
          whatsapp: form.whatsapp || undefined,
          email: form.email || undefined,
          gender: form.gender || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          address: form.address || undefined,
          preferredTiming: form.preferredTiming || undefined,
          message: form.message || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccess(true);
      setApplicationId(data.applicationId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 bg-slate-50 min-h-screen pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#0D4A28] to-[#1B6B3A] py-12 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href="/admissions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:underline mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admissions Overview
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Online Admission Application
          </h1>
          <p className="text-emerald-100 mt-2 text-sm sm:text-base">
            Please fill out the form below carefully. Our admission committee will review your application and contact you promptly.
          </p>
        </div>
      </section>

      {/* Main Form Box */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 p-6 sm:p-10">
          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-[#1B6B3A] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Application Submitted Successfully!</h2>
              <p className="text-gray-600 max-w-md mx-auto text-sm leading-relaxed">
                Thank you for applying to Nizami Islamic Center & Education. Your application reference ID is:
              </p>
              <div className="inline-block bg-slate-100 px-4 py-2 rounded-lg font-mono font-bold text-gray-800 text-base">
                {applicationId || 'APP-RECEIVED'}
              </div>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Our academic counselors will get in touch on your provided contact number within 24 to 48 hours.
              </p>
              <div className="pt-6 flex justify-center gap-4">
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-xl bg-[#1B6B3A] text-white text-sm font-semibold hover:bg-[#0D4A28] transition"
                >
                  Return to Homepage
                </Link>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setForm({
                      applicantName: '',
                      fatherName: '',
                      guardianPhone: '',
                      whatsapp: '',
                      email: '',
                      gender: 'male',
                      dateOfBirth: '',
                      address: '',
                      divisionId: '',
                      preferredTiming: 'morning',
                      message: '',
                    });
                  }}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Student Details */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#1B6B3A]" /> 1. Student Details
                </h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Applicant Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Zaid Khan"
                      value={form.applicantName}
                      onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Father / Guardian Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tariq Khan"
                      value={form.fatherName}
                      onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Gender</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A] text-sm"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5">
                  2. Contact & Address
                </h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Primary Phone / Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={form.guardianPhone}
                      onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A] text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="parent@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A] text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Residential Address
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Complete street address, city, pin code"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A] text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5">
                  3. Program Preferences
                </h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Preferred Batch Timing
                    </label>
                    <select
                      value={form.preferredTiming}
                      onChange={(e) => setForm({ ...form, preferredTiming: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A] text-sm"
                    >
                      <option value="morning">Morning (07:00 AM - 12:00 PM)</option>
                      <option value="afternoon">Afternoon (01:00 PM - 04:00 PM)</option>
                      <option value="evening">Evening (04:30 PM - 08:00 PM)</option>
                      <option value="weekend">Weekend Special</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Comments / Specific Course Desired
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hifz-ul-Quran or Class 10 Science"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A] text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-[#1B6B3A] text-white font-bold hover:bg-[#0D4A28] transition shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
