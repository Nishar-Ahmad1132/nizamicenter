import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db/mongoose';
import Course from '@/models/Course';
import { BookOpen, Clock, Users, CheckCircle, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Islamic Courses | Nizami Islamic Center',
  description: 'Explore all courses in Hifz, Nazra, Tajweed, Arabic language, and Islamic theology.',
};

async function getAllCourses() {
  try {
    await dbConnect();
    const courses = await Course.find({ status: 'active', isActive: true })
      .populate('branchIds', 'name')
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(courses));
  } catch {
    return [];
  }
}

export default async function IslamicCoursesPage() {
  const courses = await getAllCourses();

  const defaultCourses = [
    {
      name: { en: 'Full-Time Hifz-ul-Qur’an' },
      category: 'Qur’an',
      duration: '2 to 3 Years',
      fee: 2000,
      description: {
        en: 'Complete Qur’an memorization program under the guidance of certified Huffaz with rigorous daily revision and Tajweed mastery.',
      },
      ageEligibility: '8 years & above',
    },
    {
      name: { en: 'Nazra Qur’an with Tajweed Rules' },
      category: 'Qur’an',
      duration: '6 Months to 1 Year',
      fee: 1000,
      description: {
        en: 'Foundational Qaida to fluent Qur’an recitation emphasizing precise pronunciation (Makharij) and Tajweed rules.',
      },
      ageEligibility: '5 years & above',
    },
    {
      name: { en: 'Classical Arabic Grammar & Fluency' },
      category: 'Language',
      duration: '1 Year',
      fee: 1500,
      description: {
        en: 'Learn Sarf, Nahw, and vocabulary to comprehend the Holy Qur’an and classical Islamic texts directly.',
      },
      ageEligibility: '12 years & above',
    },
    {
      name: { en: 'Dars-e-Nizami (Alim Course) Foundation' },
      category: 'Theology',
      duration: '2 Years',
      fee: 2500,
      description: {
        en: 'Foundational Islamic scholarship program covering Fiqh, Hadith principles, Tafseer, and Islamic history.',
      },
      ageEligibility: '14 years & above',
    },
    {
      name: { en: 'Deeniyat & Tarbiyah for School Students' },
      category: 'Moral Education',
      duration: 'Evening / Weekend',
      fee: 800,
      description: {
        en: 'Custom-tailored evening program for school-going students covering daily Masnoon Duas, basic Fiqh, Seerah, and Islamic manners.',
      },
      ageEligibility: '6 to 16 years',
    },
    {
      name: { en: 'Weekend Islamic Studies for Adults' },
      category: 'Adult Education',
      duration: '6 Months',
      fee: 1200,
      description: {
        en: 'Special weekend course designed for working professionals and university students to deepen their foundational religious understanding.',
      },
      ageEligibility: '18 years & above',
    },
  ];

  const displayCourses = courses.length > 0 ? courses : defaultCourses;

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-[#0D4A28] py-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider mb-2">
            Spiritual & Traditional Curriculum
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Islamic Center Courses
          </h1>
          <p className="text-emerald-100 mt-2 max-w-2xl text-base sm:text-lg">
            Comprehensive programs designed for students of all ages seeking authentic religious knowledge and Qur’anic mastery.
          </p>
        </div>
      </section>

      {/* Courses List */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {displayCourses.map((c: any, index: number) => (
            <div
              key={c._id || index}
              className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-lg hover:border-emerald-300 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-[#1B6B3A] rounded-full border border-emerald-100">
                    {c.category || 'Islamic Studies'}
                  </span>
                  {c.duration && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {c.duration}
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {c.name?.en || 'Course Name'}
                </h2>

                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {c.description?.en || c.shortDescription?.en || 'In-depth curriculum taught with traditional pedagogy and individual student progress monitoring.'}
                </p>

                {c.ageEligibility && (
                  <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
                    <span className="font-semibold text-gray-700">Eligibility:</span> {c.ageEligibility}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 block">Monthly Tuition</span>
                  <span className="text-lg font-bold text-[#1B6B3A]">
                    {c.fee ? formatCurrency(c.fee) : 'Flexible / Subsidized'}
                  </span>
                </div>
                <Link
                  href="/admissions/apply"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#1B6B3A] text-white hover:bg-[#0D4A28] transition shadow-sm"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
