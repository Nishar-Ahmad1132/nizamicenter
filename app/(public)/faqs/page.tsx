'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

export default function FAQsPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Can a student pursue both school academic tuition and Hifz-ul-Qur’an concurrently?',
      a: 'Yes! Our dual-track schedule is specifically engineered for this. Students typically attend the early morning Hifz session (or evening session) and their regular school classes in between, followed by focused academic coaching in the late afternoon. Our counselors help structure a balanced daily timetable preventing student burnout.',
    },
    {
      q: 'What is the average duration required to complete Hifz-ul-Qur’an?',
      a: 'Depending on the student’s memory retention, consistency, and initial Tajweed proficiency, full Qur’an memorization typically takes between 2 to 3 years. We emphasize solid daily revision (Daur) over hasty completion so the Qur’an remains deeply preserved.',
    },
    {
      q: 'Which academic boards do you prepare students for in Nizami Education?',
      a: 'We cater to CBSE, ICSE, and State Board curriculums from Class 1 through Class 12. For Class 10 and 12, our teachers utilize comprehensive board question banks, mock test series, and past 10-year question papers.',
    },
    {
      q: 'Are there separate batches or arrangements for female students?',
      a: 'Yes, absolutely. We maintain distinct, fully segregated classrooms and sections for female students with qualified female faculty and teachers for both Islamic courses and academic subjects.',
    },
    {
      q: 'What is the fee payment schedule and are scholarships available?',
      a: 'Tuition fees are structured on a straightforward monthly basis. We offer need-based and merit-based concessions (up to 100% tuition waiver) for orphans, underprivileged families, and exceptional students evaluated by our welfare board.',
    },
    {
      q: 'How can parents monitor their child’s daily attendance and performance?',
      a: 'Parents receive private credentials to our Parent Portal where they can view daily attendance records, weekly test marks, teacher feedback notes, and fee payment receipts in real time.',
    },
  ];

  return (
    <div className="pt-20 bg-slate-50 min-h-screen pb-16">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0D4A28] to-[#1B6B3A] py-14 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider mb-2">
            Got Questions?
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-emerald-100 mt-2 max-w-xl mx-auto text-base">
            Everything you need to know about our admissions, schedules, curricula, and student care.
          </p>
        </div>
      </section>

      {/* Accordion FAQ */}
      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm transition"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-bold text-gray-900 hover:text-[#1B6B3A] transition"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#1B6B3A] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-gray-600 leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200/80 p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1B6B3A] flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
            Our admissions team is available daily to assist you with course selection and branch tours.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-2.5 rounded-xl bg-[#1B6B3A] text-white text-sm font-semibold hover:bg-[#0D4A28] transition"
            >
              Contact Us
            </Link>
            <Link
              href="/admissions/apply"
              className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Apply Online
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
