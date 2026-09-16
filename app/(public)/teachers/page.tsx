import { Metadata } from 'next';
import dbConnect from '@/lib/db/mongoose';
import Teacher from '@/models/Teacher';
import { Award, BookOpen, GraduationCap, Mail, Phone, Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function getItemName(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item.name === 'string') return item.name;
  if (typeof item.name === 'object' && item.name) {
    return item.name.en || item.name.hi || item.name.ur || '';
  }
  return '';
}

export const metadata: Metadata = {
  title: 'Our Faculty & Teachers | Nizami Islamic Center & Education',
  description: 'Meet our dedicated Huffaz, Muftis, and subject-matter educators committed to student growth and academic success.',
};

async function getTeachers() {
  try {
    await dbConnect();
    const teachers = await Teacher.find({ status: 'active', isActive: true, isPublic: true })
      .populate('branchIds', 'name')
      .populate('subjectIds', 'name')
      .populate('courseIds', 'name')
      .lean();
    return JSON.parse(JSON.stringify(teachers));
  } catch {
    return [];
  }
}

export default async function TeachersPage() {
  const teachers = await getTeachers();

  const defaultTeachers = [
    {
      name: 'Hazrat Hafiz o Qari Ahmad Raza Nizami',
      qualification: 'Hafiz-ul-Qur’an, Qari, Senior Scholar',
      experience: '15+ Years in Qur’anic Sciences & Institutional Leadership',
      bio: 'Nazim-e-Aala & Co-Director leading the Nizami Islamic Center. Oversees authentic Qur’an memorization, Tajweed verification, and moral tarbiyah across all branches.',
      department: 'Head — Nizami Islamic Center',
    },
    {
      name: 'Sir Istekhar Ahmad',
      qualification: 'M.Sc., B.Ed, Academic Specialist',
      experience: '15+ Years in Academic Management & School Coaching',
      bio: 'Academic Director & Co-Director operating equally to manage Nizami Education. Oversees school curriculum, faculty excellence, and student board exam preparation.',
      department: 'Head — Nizami Education',
    },
    {
      name: 'Qari Abdul Rahman',
      qualification: 'Hafiz-ul-Qur’an, Qirat Sab’ah Certified',
      experience: '12+ Years in Hifz & Tajweed Guidance',
      bio: 'Renowned Qari specializing in foundational phonetics, Tajweed rule application, and intensive Hifz Daur.',
      department: 'Islamic Center',
    },
    {
      name: 'Dr. Tariq Anwar',
      qualification: 'Ph.D. in Physics, M.Sc.',
      experience: '14+ Years in Senior Secondary Coaching',
      bio: 'Expert physics instructor renowned for simplifying mechanics, electrodynamics, and Board test strategies.',
      department: 'Nizami Education',
    },
    {
      name: 'Er. Zeeshan Akhtar',
      qualification: 'B.Tech (Hons), M.Tech',
      experience: '9+ Years in Advanced Mathematics',
      bio: 'Passionate math educator guiding Class 9-12 students with algebraic problem-solving and calculus theorems.',
      department: 'Nizami Education',
    },
    {
      name: 'Prof. Aisha Siddiqui',
      qualification: 'M.Sc. Chemistry, B.Ed',
      experience: '8+ Years in School Board Preparation',
      bio: 'Specialist in organic reaction mechanisms and chemical bonding for Class 10 & 12 Board examinations.',
      department: 'Nizami Education',
    },
    {
      name: 'Qari Mohammad Farooq',
      qualification: 'Hafiz & Qari, Alimiyat',
      experience: '10+ Years in Nazra & Qaida Foundations',
      bio: 'Dedicated primary Qur’an educator with infinite patience, helping young children master proper articulation.',
      department: 'Islamic Center',
    },
  ];

  const displayTeachers = teachers.length > 0 ? teachers : defaultTeachers;

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#0D4A28] to-[#1B6B3A] py-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider mb-2">
            Mentorship & Scholarship
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Our Respected Teachers & Scholars
          </h1>
          <p className="text-emerald-100 mt-2 max-w-2xl text-base sm:text-lg">
            Guiding our students with wisdom, deep subject mastery, and exemplary moral character.
          </p>
        </div>
      </section>

      {/* Teachers Grid */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {displayTeachers.map((t: any, idx: number) => (
            <div
              key={t._id || idx}
              className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-lg hover:border-emerald-300 transition"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#1B6B3A] flex items-center justify-center font-bold text-xl shrink-0">
                    {t.name
                      ?.split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((n: string) => n[0])
                      .join('') || 'T'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-snug">{t.name}</h2>
                    <p className="text-xs font-semibold text-[#1B6B3A] mt-0.5">
                      {t.qualification || 'Certified Educator'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-xs text-gray-600">
                  {t.experience && (
                    <p className="flex items-center gap-2 font-medium text-amber-700">
                      <Award className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span>{t.experience}</span>
                    </p>
                  )}
                  {t.department && (
                    <p className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{t.department}</span>
                    </p>
                  )}
                </div>

                {/* Assigned Branches */}
                {t.branchIds && t.branchIds.length > 0 && (
                  <div className="mb-3.5">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-blue-600" /> Teaching Branches:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.branchIds.map((b: any) => (
                        <span
                          key={b._id || b}
                          className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-medium rounded-md border border-blue-100"
                        >
                          {typeof b === 'object' ? b.name : b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assigned Subjects & Courses */}
                {((t.subjectIds && t.subjectIds.length > 0) || (t.courseIds && t.courseIds.length > 0)) && (
                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-purple-600" /> Subjects &amp; Courses:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.subjectIds?.map((s: any) => (
                        <span
                          key={s._id || s}
                          className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 text-[11px] font-medium rounded-md border border-purple-100"
                          title="Academic Subject (NE)"
                        >
                          {getItemName(s) || s.code || s}
                        </span>
                      ))}
                      {t.courseIds?.map((c: any) => (
                        <span
                          key={c._id || c}
                          className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-medium rounded-md border border-emerald-100"
                          title="Islamic Course (NIC)"
                        >
                          {getItemName(c) || c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-600 leading-relaxed">
                  {t.bio || 'Dedicated educator striving to bring the best out of every student through rigorous academic standards and personal support.'}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Active Faculty
                </span>
                <Link
                  href="/admissions"
                  className="text-xs font-semibold text-[#1B6B3A] hover:text-[#14522c] hover:underline flex items-center gap-1"
                >
                  Enroll with Teacher &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
