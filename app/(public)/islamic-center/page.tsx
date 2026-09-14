import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db/mongoose';
import Course from '@/models/Course';
import { BookOpen, Star, Clock, CheckCircle2, Award, Sparkles, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Nizami Islamic Center | Traditional Qur’an, Hifz & Islamic Studies',
  description: 'Explore Nazra, Hifz-ul-Qur’an, Tajweed, Arabic language, and Islamic theology courses taught by qualified scholars.',
};

async function getIslamicCourses() {
  try {
    await dbConnect();
    const courses = await Course.find({ status: 'active', isActive: true })
      .populate('branchIds', 'name')
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(6)
      .lean();
    return JSON.parse(JSON.stringify(courses));
  } catch {
    return [];
  }
}

export default async function IslamicCenterPage() {
  const courses = await getIslamicCourses();

  const features = [
    {
      title: 'Hifz-ul-Qur’an with Tajweed',
      desc: 'Structured daily memorization cycles, revision schedules (Daur), and certified Makharij correction.',
    },
    {
      title: 'Nazra & Foundational Qaida',
      desc: 'Nurturing young children and beginners to read the Holy Qur’an with flawless articulation.',
    },
    {
      title: 'Islamic Theology & Fiqh',
      desc: 'Essential daily jurisprudence, Hadith studies, Seerah of Prophet Muhammad (PBUH), and Akhlaq.',
    },
    {
      title: 'Arabic Language & Grammar',
      desc: 'Classical and conversational Arabic enabling deeper comprehension of Qur’anic verses and traditions.',
    },
  ];

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      {/* Hero Banner */}
      <section className="relative py-20 bg-gradient-to-br from-[#0D4A28] via-[#1B6B3A] to-[#0A381E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" /> Sacred Traditional Learning
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
              Nizami Islamic Center
            </h1>
            <p className="text-lg text-emerald-100 mb-8 leading-relaxed">
              Preserving sacred tradition through authentic Qur’an memorization, Tajweed excellence, and character-building Islamic disciplines in a nurturing environment.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/islamic-center/courses"
                className="px-6 py-3 rounded-xl bg-[#D4AF37] text-gray-900 font-bold hover:bg-[#c49f2c] transition shadow-md"
              >
                Browse All Courses
              </Link>
              <Link
                href="/admissions/apply"
                className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold transition"
              >
                Apply for Islamic Studies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Programs */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Our Sacred Offerings</h2>
          <p className="mt-3 text-gray-600">Tailored programs for every age group and knowledge stage</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B6B3A] flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Islamic Courses</h2>
              <p className="text-gray-600 mt-1">Enroll today to begin your spiritual and educational journey</p>
            </div>
            <Link
              href="/islamic-center/courses"
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-[#1B6B3A] font-semibold hover:underline"
            >
              View all courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {courses.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              courses.map((c: any) => (
                <div
                  key={c._id}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-300 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-[#1B6B3A] rounded-full">
                        {c.category || 'Islamic Studies'}
                      </span>
                      {c.duration && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" /> {c.duration}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {c.name?.en || 'Qur’an Course'}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {c.shortDescription?.en || c.description?.en || 'Comprehensive course taught with dedicated guidance and interactive lessons.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Course Fee</p>
                      <p className="text-lg font-bold text-[#1B6B3A]">
                        {c.fee ? formatCurrency(c.fee) : 'Flexible'}
                      </p>
                    </div>
                    <Link
                      href="/admissions/apply"
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#1B6B3A] text-white hover:bg-[#0D4A28] transition"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              [
                { title: 'Hifz-ul-Qur’an Program', duration: '2-3 Years', fee: 1500, category: 'Memorization' },
                { title: 'Tajweed & Makharij Intensive', duration: '6 Months', fee: 800, category: 'Qira’at' },
                { title: 'Alimiyat Foundation (Dars-e-Nizami)', duration: '1 Year', fee: 1200, category: 'Theology' },
              ].map((fallback, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-[#1B6B3A] rounded-full">
                      {fallback.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-3 mb-2">{fallback.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Comprehensive study plan under certified teachers with daily progress monitoring and personal mentorship.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-bold text-gray-800">{fallback.duration}</p>
                    </div>
                    <Link
                      href="/admissions/apply"
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#1B6B3A] text-white hover:bg-[#0D4A28] transition"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Routine & Discipline */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-emerald-900 text-white rounded-3xl p-8 sm:p-12">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Cultivating Sunnah, Discipline, and Akhlaq
            </h2>
            <p className="text-emerald-100 leading-relaxed mb-6">
              Beyond academic texts, students at Nizami Islamic Center partake in congregational prayers (Salah), daily Dua memorization, and ethical etiquette workshops that shape lifelong character.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span>Daily congregational prayers with Adhan</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span>One-on-one memorization review</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span>Weekly Friday spiritual discourses</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <span>Separate classes for boys and girls</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
