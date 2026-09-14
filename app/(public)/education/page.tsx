import { Metadata } from 'next';
import Link from 'next/link';
import { GraduationCap, BookOpen, CheckCircle, ArrowRight, Laptop, Award, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nizami Education | School & College Academic Coaching',
  description: 'Comprehensive academic tuition from Class 1 to 12, Board examination preparation, Science and Commerce streams, and competitive coaching.',
};

export default function EducationOverviewPage() {
  const levels = [
    {
      title: 'Primary Foundation (Class 1 - 5)',
      desc: 'Developing literacy, numerical fluency, scientific curiosity, and solid study habits in an engaging, supportive environment.',
      subjects: ['English', 'Mathematics', 'Environmental Science', 'Hindi / Urdu'],
      href: '/education/classes',
    },
    {
      title: 'Middle School (Class 6 - 8)',
      desc: 'Concept-centric learning bridging basic knowledge with advanced analytical thought across sciences and mathematics.',
      subjects: ['Science (Physics, Chemistry, Biology)', 'Mathematics', 'Social Studies', 'Languages'],
      href: '/education/classes',
    },
    {
      title: 'Secondary & Board Prep (Class 9 - 10)',
      desc: 'Rigorous CBSE/State Board preparation, test series, past paper analysis, and intensive doubt-clearing sessions.',
      subjects: ['Higher Mathematics', 'Integrated Science', 'Social Sciences', 'Language & Literature'],
      href: '/education/classes',
    },
    {
      title: 'Senior Secondary (Class 11 - 12)',
      desc: 'Specialized coaching for Science (PCM/PCB) and Commerce streams with continuous assessment and mentorship.',
      subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Accountancy', 'Economics'],
      href: '/education/classes',
    },
  ];

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      {/* Hero Banner */}
      <section className="relative py-20 bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-6">
              <GraduationCap className="w-4 h-4" /> Academic Excellence & Competitive Rigor
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Nizami Education
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Empowering students from Class 1 to 12 with conceptual clarity, personalized mentoring, and top-tier academic coaching to excel in Board and competitive examinations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/education/classes"
                className="px-6 py-3 rounded-xl bg-[#1B6B3A] text-white font-semibold hover:bg-[#0D4A28] transition shadow-md"
              >
                Explore Classes & Batches
              </Link>
              <Link
                href="/admissions/apply"
                className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold transition"
              >
                Apply for Admission
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-gray-900">Our Proven Pedagogy</h2>
          <p className="mt-3 text-gray-600">Structured for concept mastery and consistent high scores</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Concept First Learning</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              We dismantle rote learning in favor of foundational comprehension, real-world examples, and step-by-step problem-solving methods.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1B6B3A] flex items-center justify-center mb-6">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Weekly Test Series</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Continuous assessment through weekly topic tests, monthly cumulative exams, and detailed performance analytics shared with parents.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#D4AF37] flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Small Batch Mentorship</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Optimal student-to-teacher ratios ensuring every learner receives personal attention, dedicated doubt-solving, and custom study plans.
            </p>
          </div>
        </div>
      </section>

      {/* Academic Stages */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Academic Programs by Grade</h2>
            <p className="mt-3 text-gray-600">Tailored to the syllabus requirements of major educational boards</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {levels.map((lvl, index) => (
              <div
                key={index}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-7 flex flex-col justify-between hover:border-blue-300 transition"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{lvl.title}</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">{lvl.desc}</p>
                  
                  <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Key Subjects Covered:</p>
                    <div className="flex flex-wrap gap-2">
                      {lvl.subjects.map((sub, sIdx) => (
                        <span key={sIdx} className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full font-medium">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <Link
                    href={lvl.href}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1B6B3A] hover:underline"
                  >
                    View Class Details <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/admissions/apply"
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#1B6B3A] text-white hover:bg-[#0D4A28] transition"
                  >
                    Enroll Batch
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
