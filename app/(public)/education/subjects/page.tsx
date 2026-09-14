import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db/mongoose';
import Subject from '@/models/Subject';
import { BookMarked, Atom, Calculator, Globe, Languages, Code, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Academic Subjects | Nizami Education',
  description: 'Specialized subject coaching in Mathematics, Physics, Chemistry, Biology, English, and Social Sciences.',
};

async function getSubjects() {
  try {
    await dbConnect();
    const subjects = await Subject.find({ status: 'active', isActive: true })
      .sort({ name: 1 })
      .lean();
    return JSON.parse(JSON.stringify(subjects));
  } catch {
    return [];
  }
}

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  const defaultSubjects = [
    { name: { en: 'Mathematics' }, code: 'MATH', desc: 'Algebra, Geometry, Trigonometry, and Calculus taught through clear proofs, theorem breakdowns, and problem-solving shortcuts.' },
    { name: { en: 'Physics' }, code: 'PHY', desc: 'Mechanics, Electromagnetism, Optics, and Modern Physics explained with demonstrations, numerical drills, and concept visualization.' },
    { name: { en: 'Chemistry' }, code: 'CHEM', desc: 'Organic reaction mechanisms, Inorganic nomenclature, and Physical chemistry equations simplified for board tests.' },
    { name: { en: 'Biology' }, code: 'BIO', desc: 'Cell biology, Human anatomy, Genetics, and Ecology supported by detailed diagram practice and comprehensive notes.' },
    { name: { en: 'English Literature & Grammar' }, code: 'ENG', desc: 'Advanced grammar, creative comprehension, essay construction, and literature textual analysis for top marks.' },
    { name: { en: 'Social Science (History, Geo, Civics)' }, code: 'SST', desc: 'Engaging timelines, map works, constitutional foundations, and economic fundamentals presented with high-yield revision summaries.' },
  ];

  const displaySubjects = subjects.length > 0 ? subjects : defaultSubjects;

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-[#1A1A2E] py-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider mb-2">
            Subject-Specific Mastery
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Academic Subjects Offered
          </h1>
          <p className="text-slate-300 mt-2 max-w-2xl text-base sm:text-lg">
            Experienced subject-matter specialists helping students master core fundamentals and high-scoring exam techniques.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {displaySubjects.map((sub: any, idx: number) => (
            <div
              key={sub._id || idx}
              className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {sub.code || 'SUB'}
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                    Classes 6 - 12
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {sub.name?.en || 'Subject Name'}
                </h2>

                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {sub.desc || sub.description || 'Specialized coaching with chapter-wise problem sets, formula booklets, and previous year board questions.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Includes Test Series</span>
                <Link
                  href="/admissions/apply"
                  className="inline-flex items-center gap-1 text-sm font-bold text-[#1B6B3A] hover:underline"
                >
                  Enroll Subject <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
