'use client';

import { useState } from 'react';
import {
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  MessageSquare,
  Sparkles,
  Building,
  Calendar,
  Loader2,
  LucideIcon,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TrackedEnquiry {
  id: string;
  name: string;
  interestedDivision?: string;
  interestedClass?: string;
  interestedCourse?: string;
  branchName: string;
  branchPhone: string;
  message?: string;
  status: 'new' | 'contacted' | 'followup' | 'converted' | 'resolved' | 'not_interested';
  adminResponse?: string | null;
  respondedAt?: string | null;
  createdAt: string;
}

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');

  // Form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    interestedDivision: 'Both',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracking state
  const [trackPhone, setTrackPhone] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedEnquiries, setTrackedEnquiries] = useState<TrackedEnquiry[] | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackPhone.trim()) {
      setTrackError('Please enter your phone number to check status.');
      return;
    }

    setTrackingLoading(true);
    setTrackError(null);
    setTrackedEnquiries(null);

    try {
      const res = await fetch('/api/enquiries/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: trackPhone.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to search for enquiries');
      }

      if (!data.found || data.enquiries.length === 0) {
        setTrackError('No enquiries found for this phone number. Please verify the number or submit a new inquiry.');
      } else {
        setTrackedEnquiries(data.enquiries);
      }
    } catch (err) {
      setTrackError((err as Error).message);
    } finally {
      setTrackingLoading(false);
    }
  };

  const statusDisplay: Record<
    string,
    { label: string; badge: string; desc: string; icon: LucideIcon }
  > = {
    new: {
      label: 'Received / Under Review',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: 'Our admissions desk has received your inquiry and a counselor will review it shortly.',
      icon: Clock,
    },
    contacted: {
      label: 'Contacted by Counselor',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      desc: 'Our counselor has reached out via WhatsApp or phone call.',
      icon: MessageSquare,
    },
    followup: {
      label: 'Follow-up In Progress',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      desc: 'Campus visit or admission document follow-up is underway.',
      icon: AlertCircle,
    },
    converted: {
      label: 'Admission Confirmed / Enrolled',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      desc: 'Welcome to Nizami Center! Your admission has been confirmed.',
      icon: CheckCircle2,
    },
    resolved: {
      label: 'Resolved / Answered',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
      desc: 'Your question or request has been answered by the administration.',
      icon: CheckCircle2,
    },
    not_interested: {
      label: 'Closed',
      badge: 'bg-gray-100 text-gray-700 border-gray-200',
      desc: 'Inquiry closed.',
      icon: AlertCircle,
    },
  };

  return (
    <div className="pt-20 bg-slate-50 min-h-screen pb-16">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0D4A28] to-[#1B6B3A] py-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider mb-2">
            Get in Touch & Admissions Helpdesk
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Contact & Inquiry Center
          </h1>
          <p className="text-emerald-100 mt-2 max-w-2xl text-base">
            Have questions about admissions, academic syllabus, or fees? Submit an inquiry or track your existing request in real time.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Details Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Center Information</h2>

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B6B3A] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Main Center (Kokan Nagar)</p>
                    <p className="text-xs mt-0.5">
                      Habeeb Ansari Chawl, Near Quba Masjid, Kokan Nagar, Baneli, Titwala (E), Maharashtra
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B6B3A] flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Mobile / Helpline</p>
                    <a href="tel:8779282185" className="text-sm font-bold text-[#1B6B3A] hover:underline">
                      8779282185
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B6B3A] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Sessions & Timings</p>
                    <p className="text-xs mt-0.5">Subah, Dopahar, Sham (Morning, Afternoon, Evening batches)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-base mb-2 text-[#D4AF37]">Immediate WhatsApp Inquiry</h3>
              <p className="text-xs text-emerald-100 leading-relaxed mb-4">
                Chat directly with our administrative desk for admissions, batch schedules, or branch visits.
              </p>
              <a
                href="https://wa.me/918779282185?text=Assalamualaikum%2C%20I%20want%20to%20inquire%20about%20admission%20at%20Nizami%20Islamic%20Center"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-block text-center py-2.5 px-4 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:bg-[#1EBE5D] transition"
              >
                WhatsApp (8779282185)
              </a>
            </div>
          </div>

          {/* Form & Tracker Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200/80 shadow-sm">
              {/* Tab Selector */}
              <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('submit')}
                  className={`pb-2 px-3 text-sm font-bold border-b-2 transition ${
                    activeTab === 'submit'
                      ? 'border-[#1B6B3A] text-[#1B6B3A]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Submit New Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('track')}
                  className={`pb-2 px-3 text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'track'
                      ? 'border-[#1B6B3A] text-[#1B6B3A]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Search className="w-4 h-4" /> Track Inquiry Status
                </button>
              </div>

              {/* TAB 1: SUBMIT NEW INQUIRY */}
              {activeTab === 'submit' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us an Inquiry</h2>
                  <p className="text-gray-600 text-sm mb-6">
                    Fill out the form below and our counseling desk will get back to you shortly.
                  </p>

                  {success ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-16 h-16 bg-emerald-100 text-[#1B6B3A] rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Message Received!</h3>
                      <p className="text-gray-600 text-sm max-w-md mx-auto">
                        Thank you for contacting Nizami Islamic Center & Education. Our admissions representative will reach out to you within 24 hours.
                      </p>
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setSuccess(false);
                            setForm({
                              name: '',
                              phone: '',
                              whatsapp: '',
                              email: '',
                              interestedDivision: 'Both',
                              message: '',
                            });
                          }}
                          className="px-6 py-2.5 rounded-xl bg-[#1B6B3A] text-white text-sm font-semibold hover:bg-[#0D4A28] transition"
                        >
                          Send Another Message
                        </button>
                        <button
                          onClick={() => {
                            setTrackPhone(form.phone);
                            setActiveTab('track');
                          }}
                          className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200 transition"
                        >
                          Track Inquiry Status
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Farhan Ali"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A] text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 9876543210"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
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

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Email Address
                          </label>
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A] text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Interested In
                          </label>
                          <select
                            value={form.interestedDivision}
                            onChange={(e) => setForm({ ...form, interestedDivision: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A] text-sm"
                          >
                            <option value="Nizami Islamic Center">Nizami Islamic Center (Hifz / Nazra / Arabic)</option>
                            <option value="Nizami Education">Nizami Education (Class 1-12 School Tuition)</option>
                            <option value="Both">Both Divisions / Dual Enrollment</option>
                            <option value="General Inquiry">General Center Inquiry</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Your Query or Message
                          </label>
                          <textarea
                            rows={4}
                            placeholder="Ask about batch timings, fees, class syllabus..."
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A] text-sm"
                          />
                        </div>
                      </div>

                      <div className="pt-3 flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-8 py-3 rounded-xl bg-[#1B6B3A] text-white font-bold hover:bg-[#0D4A28] transition shadow-md flex items-center gap-2 disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                          {loading ? 'Submitting...' : 'Send Message'}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* TAB 2: TRACK INQUIRY STATUS */}
              {activeTab === 'track' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Track Your Inquiry</h2>
                    <p className="text-gray-600 text-sm">
                      Enter your phone number below to see real-time updates and official counselor replies.
                    </p>
                  </div>

                  <form onSubmit={handleTrackInquiry} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={trackPhone}
                        onChange={(e) => setTrackPhone(e.target.value)}
                        placeholder="Enter registered mobile number (e.g. 1234567899)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/30 focus:border-[#1B6B3A]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={trackingLoading}
                      className="px-6 py-2.5 rounded-xl bg-[#1B6B3A] text-white font-bold hover:bg-[#0D4A28] transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {trackingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      Check Status
                    </button>
                  </form>

                  {trackError && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <span>{trackError}</span>
                    </div>
                  )}

                  {/* Tracked Results List */}
                  {trackedEnquiries && (
                    <div className="space-y-4 pt-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Found {trackedEnquiries.length} {trackedEnquiries.length === 1 ? 'Inquiry' : 'Inquiries'}
                      </h3>

                      {trackedEnquiries.map((item) => {
                        const statusMeta = statusDisplay[item.status] || statusDisplay.new;
                        const StatusIcon = statusMeta.icon;

                        return (
                          <div
                            key={item.id}
                            className="bg-slate-50/70 border border-gray-200/90 rounded-2xl p-5 space-y-4 hover:shadow-md transition"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900 text-base">{item.name}</span>
                                  <span className="text-xs text-gray-400">#{item.id.slice(-6).toUpperCase()}</span>
                                </div>
                                <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                                  {item.interestedDivision || 'General Inquiry'}
                                  {item.interestedClass ? ` — Class ${item.interestedClass}` : ''}
                                  {item.interestedCourse ? ` — ${item.interestedCourse}` : ''}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusMeta.badge}`}
                                >
                                  <StatusIcon className="w-3.5 h-3.5" />
                                  {statusMeta.label}
                                </span>
                              </div>
                            </div>

                            {/* Status Description */}
                            <p className="text-xs text-gray-600 italic bg-white/60 p-2.5 rounded-xl border border-gray-200/60">
                              ℹ️ {statusMeta.desc}
                            </p>

                            {/* User's Original Message */}
                            {item.message && (
                              <div className="text-xs">
                                <span className="font-semibold text-gray-500 block mb-0.5">Your Submitted Query:</span>
                                <p className="text-gray-800 bg-white p-3 rounded-xl border border-gray-200/80">
                                  &ldquo;{item.message}&rdquo;
                                </p>
                              </div>
                            )}

                            {/* Official Admin Response (if counselor replied!) */}
                            {item.adminResponse ? (
                              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                    Official Counselor Reply
                                  </span>
                                  {item.respondedAt && (
                                    <span className="text-[10px] text-emerald-700">
                                      {formatDate(item.respondedAt)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-emerald-950 font-medium whitespace-pre-wrap leading-relaxed">
                                  {item.adminResponse}
                                </p>
                              </div>
                            ) : (
                              <div className="bg-gray-100/70 border border-gray-200 rounded-xl p-3 text-[11px] text-gray-500">
                                Our counselor will contact you via WhatsApp/Phone shortly. Once updated, any official response will appear here.
                              </div>
                            )}

                            {/* Campus & Timestamp Info */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-gray-400">
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3 text-gray-400" />
                                {item.branchName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                Submitted: {formatDate(item.createdAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
