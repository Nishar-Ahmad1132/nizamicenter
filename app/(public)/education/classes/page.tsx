import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db/mongoose';
import Class from '@/models/Class';
import { GraduationCap, BookOpen, Clock, Users, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Classes & Batches | Nizami Education',
  description: 'Explore academic classes from Class 1 to Class 12 with customized curriculum, batch timings, and expert faculty.',
};

async function getClasses() {
  try {
    await dbConnect();
    const classes = await Class.find({ status: 'active', isActive: true })
      .sort({ numericValue: 1, displayOrder: 1 })
      .lean();
    return JSON.parse(JSON.stringify(classes));
  } catch {
    return [];
  }
}

export default async function ClassesPage() {
  const classes = await getClasses();

  const defaultClasses = [
    { name: { en: 'Class 1 to 5 (Primary Foundation)' }, numericValue: 5, description: 'Foundational English, Mathematics, General Science, and creative cognitive development with interactive learning.' },
    { name: { en: 'Class 6 (Middle School)' }, numericValue: 6, description: 'Conceptual introduction to Physics, Chemistry, Biology, and higher arithmetic with problem-solving exercises.' },
    { name: { en: 'Class 7 (Middle School)' }, numericValue: 7, description: 'Intermediate mathematics, algebraic thinking, fundamental sciences, and comprehensive English grammar.' },
    { name: { en: 'Class 8 (Middle School)' }, numericValue: 8, description: 'Pre-secondary preparation focusing on rigorous science principles, geometric proofs, and analytical writing.' },
    { name: { en: 'Class 9 (Secondary Foundation)' }, numericValue: 9, description: 'Intensive foundation for Board exams covering detailed CBSE syllabus across Science, Math, and Social Science.' },
    { name: { en: 'Class 10 (Board Exam Preparation)' }, numericValue: 10, description: 'Specialized Board crash courses, complete syllabus coverage, weekly mock exams, and past 10-year paper practice.' },
    { name: { en: 'Class 11 Science (PCM / PCB)' }, numericValue: 11, description: 'Advanced Physics, Chemistry, Mathematics / Biology coaching aligned with school curriculum and competitive fundamentals.' },
    { name: { en: 'Class 12 Science & Commerce' }, numericValue: 12, description: 'Senior secondary board examination mastery, practical guidance, formula workshops, and intensive test series.' },
  ];

  const displayClasses = classes.length > 0 ? classes : defaultClasses;

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-[#1A1A2E] py-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider mb-2">
            Curriculum & Batches
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Academic Classes (Grade 1 - 12)
          </h1>
          <p className="text-slate-300 mt-2 max-w-2xl text-base sm:text-lg">
            Structured batches designed for conceptual clarity, regular assessments, and board exam superiority.
          </p>
        </div>
      </section>

      {/* Grid of Classes */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {displayClasses.map((cls: any, index: number) => (
            <div
              key={cls._id || index}
              className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-md hover:border-emerald-300 transition"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {cls.name?.en || `Class ${cls.numericValue}`}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {cls.description || 'Structured coaching following standard board curriculum with comprehensive study materials, chapter summaries, and regular testing.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
                    Morning / Evening
                  </span>
                  {typeof cls.fee === 'number' && cls.fee > 0 && (
                    <span className="text-xs font-bold text-[#C0392B] bg-red-50 px-2 py-1 rounded-md">
                      ₹{cls.fee}/mo
                    </span>
                  )}
                </div>
                <Link
                  href={`/admissions/apply?class=${encodeURIComponent(cls.slug || cls.name?.en || '')}`}
                  className="inline-flex items-center gap-1 text-sm font-bold text-[#1B6B3A] hover:underline"
                >
                  Enroll Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
