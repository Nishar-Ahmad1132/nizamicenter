'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function ContactPage() {
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

  return (
    <div className="pt-20 bg-slate-50 min-h-screen pb-16">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0D4A28] to-[#1B6B3A] py-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider mb-2">
            Get in Touch
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Contact & Campus Inquiries
          </h1>
          <p className="text-emerald-100 mt-2 max-w-2xl text-base">
            Have questions about admissions, fees, or curricula? Reach out to our dedicated counselors or visit one of our campuses.
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
                    <p className="text-xs mt-0.5">Habeeb Ansari Chawl, Near Quba Masjid, Kokan Nagar, Baneli, Titwala (E), Maharashtra</p>
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
                    <p className="text-xs mt-0.5">Subah, Dopahar, Sham (Morning, Afternoon, Evening)</p>
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

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 sm:p-10 border border-gray-200/80 shadow-sm">
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
