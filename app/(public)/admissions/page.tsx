import { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardCheck, FileText, UserCheck, CheckCircle2, ArrowRight, HelpCircle, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admissions & Enrollment Process | Nizami Islamic Center & Education',
  description: 'Learn about our admission criteria, necessary documentation, entrance evaluation, and apply online today.',
};

export default function AdmissionsPage() {
  const steps = [
    {
      step: '01',
      title: 'Online Application / Registration',
      desc: 'Fill out our straightforward online application form with student details and selected programs.',
    },
    {
      step: '02',
      title: 'Counseling & Evaluation',
      desc: 'An informal interaction and basic diagnostic assessment to understand the student’s learning baseline.',
    },
    {
      step: '03',
      title: 'Document Verification & Seat Offer',
      desc: 'Submission of identification documents, previous marksheet (if applicable), and official admission letter.',
    },
    {
      step: '04',
      title: 'Fee Payment & Batch Allocation',
      desc: 'Complete enrollment fee payment, receive student ID and timetable, and commence classes.',
    },
  ];

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0D4A28] via-[#1B6B3A] to-[#0A381E] py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="text-[#D4AF37] font-semibold text-xs uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Admissions Open 2025 - 2026
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-4 mb-4">
              Begin Your Educational Journey With Us
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed mb-8">
              We welcome students dedicated to academic rigor and moral excellence. Apply online in just a few minutes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/admissions/apply"
                className="px-6 py-3.5 rounded-xl bg-[#D4AF37] text-gray-900 font-bold hover:bg-[#c49f2c] transition shadow-lg inline-flex items-center gap-2"
              >
                Start Online Application <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition"
              >
                Inquire With Admission Officer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-gray-900">Simple 4-Step Admission Procedure</h2>
          <p className="mt-2 text-gray-600">A transparent and supportive enrollment experience for parents and students</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200/80 relative flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-4xl font-extrabold text-[#1B6B3A]/20 block mb-2">{s.step}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Eligibility & Documents */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Documents</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Please keep digital copies or originals ready during verification:
              </p>
              <div className="space-y-3">
                {[
                  'Student Birth Certificate or Valid ID Proof (Aadhaar / Passport)',
                  'Recent passport-size color photographs (4 copies)',
                  'Previous academic year report card or marksheet (for Class 6+)',
                  'Transfer Certificate (TC) from prior school if applicable',
                  'Guardian ID proof and emergency contact information',
                ].map((doc, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-5 h-5 text-[#1B6B3A] shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Scholarships & Financial Aid</h2>
              <p className="text-gray-600 leading-relaxed text-sm mb-4">
                At Nizami Islamic Center & Education, no deserving and sincere seeker of knowledge is turned away due to genuine financial hardships.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-emerald-900 mb-2">Merit & Need-Based Concessions</h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  We offer fee waivers of up to 100% for underprivileged students, orphans, and exceptional Hifz aspirants evaluated by our welfare committee.
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                <Phone className="w-5 h-5 text-[#1B6B3A]" />
                <span>Admission Desk Helpline: <strong>+91 98765 43210</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Apply?</h2>
          <p className="text-gray-600 mb-8">
            Complete the online application today to reserve your seat in the upcoming academic term.
          </p>
          <Link
            href="/admissions/apply"
            className="px-8 py-3.5 rounded-xl bg-[#1B6B3A] text-white font-bold hover:bg-[#0D4A28] transition shadow-md inline-block"
          >
            Go to Application Form
          </Link>
        </div>
      </section>
    </div>
  );
}
