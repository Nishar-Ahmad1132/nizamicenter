import dbConnect from '@/lib/db/mongoose';
import Branch from '@/models/Branch';
import Course from '@/models/Course';
import ClassModel from '@/models/Class';
import Teacher from '@/models/Teacher';
import Testimonial from '@/models/Testimonial';
import Notice from '@/models/Notice';
import WebsiteSetting from '@/models/WebsiteSetting';
import Division from '@/models/Division';
import { GraduationCap, BookOpen, Users, Building2, Star, ArrowRight, Phone, MapPin, ChevronRight, MessageCircle, School, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

// Plain serializable types for the view layer
type PlainCourse = {
  _id: string;
  name: { en: string };
  slug: string;
  fee?: number;
  shortDescription?: { en?: string };
  divisionId?: { _id: string; code?: string; slug?: string };
};
type PlainClass = {
  _id: string;
  name: { en: string };
  slug: string;
  numericValue?: number;
  description?: string;
  fee?: number;
  status?: string;
};
type PlainBranch = { _id: string; name: string; slug: string; area?: string; city?: string; phone?: string; address?: string; description?: { en?: string }; whatsapp?: string };
type PlainTeacher = { _id: string; name: string; qualification?: string; experience?: string; bio?: string; photo?: string; status?: string };
type PlainTestimonial = { _id: string; name: string; role?: string; message: { en?: string }; rating?: number };
type PlainNotice = { _id: string; title: { en: string }; publishDate: string };
type PlainDivision = {
  _id: string;
  name: { en: string; hi?: string; ur?: string };
  slug: string;
  code: string;
  description?: { en?: string; hi?: string; ur?: string };
  headTitle?: string;
  features?: string[];
  gradientFrom?: string;
  gradientTo?: string;
  buttonText?: string;
  buttonUrl?: string;
  icon?: string;
  isActive?: boolean;
};

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nizami Islamic Center & Nizami Education — Quality Education in Titwala',
  description:
    'Nizami Islamic Center offers Quran, Tajweed, Hifz & Islamic education. Nizami Education provides academic coaching for Classes 1–8 including Maths, Science, English & Computer.',
  alternates: { canonical: '/' },
};

async function getHomeData() {
  try {
    await dbConnect();
    const [branches, allCourses, allClasses, teachers, testimonials, notices, settings, divisions] = await Promise.all([
      Branch.find({ isActive: true }).sort({ displayOrder: 1 }).limit(6).lean(),
      Course.find({ isActive: true, status: 'active' })
        .populate('divisionId', 'slug code name')
        .sort({ displayOrder: 1 })
        .lean(),
      ClassModel.find({ isActive: true, status: 'active' })
        .populate('divisionId', 'slug code name')
        .sort({ displayOrder: 1, numericValue: 1 })
        .lean(),
      Teacher.find({ isActive: true, status: 'active', isPublic: true })
        .select('name qualification experience bio photo')
        .sort({ createdAt: 1 })
        .limit(6)
        .lean(),
      Testimonial.find({ isPublished: true, status: 'approved' })
        .sort({ displayOrder: 1 })
        .limit(6)
        .lean(),
      Notice.find({ status: 'published' })
        .sort({ publishDate: -1 })
        .limit(4)
        .lean(),
      WebsiteSetting.find({}).lean(),
      Division.find({ isActive: true }).sort({ displayOrder: 1 }).lean(),
    ]);

    const settingsMap: Record<string, string> = {};
    for (const s of settings) settingsMap[s.key] = s.value;

    // Separate Islamic Center courses (NIC) and Nizami Education courses (NE)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const islamicCourses = allCourses.filter((c: any) => !c.divisionId || c.divisionId?.code === 'NIC' || c.divisionId?.slug?.includes('islamic'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const neCourses = allCourses.filter((c: any) => c.divisionId && (c.divisionId?.code === 'NE' || c.divisionId?.slug?.includes('education')));

    // Serialize to plain objects (removes ObjectIds, Dates become strings)
    const ser = (arr: unknown[]) => JSON.parse(JSON.stringify(arr));

    return {
      branches: ser(branches) as PlainBranch[],
      islamicCourses: ser(islamicCourses) as PlainCourse[],
      neCourses: ser(neCourses) as PlainCourse[],
      neClasses: ser(allClasses) as PlainClass[],
      teachers: ser(teachers) as PlainTeacher[],
      testimonials: ser(testimonials) as PlainTestimonial[],
      notices: ser(notices) as PlainNotice[],
      settings: settingsMap,
      divisions: ser(divisions) as PlainDivision[],
    };
  } catch {
    return {
      branches: [],
      islamicCourses: [],
      neCourses: [],
      neClasses: [],
      teachers: [],
      testimonials: [],
      notices: [],
      settings: {},
      divisions: [],
    };
  }
}

export default async function HomePage() {
  const {
    branches,
    islamicCourses,
    neCourses,
    neClasses,
    teachers,
    testimonials,
    notices,
    settings,
    divisions,
  } = await getHomeData();

  const phone = settings.phone ?? '';
  const whatsapp = settings.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';
  const heroTitle = settings.heroTitle ?? 'Education for Knowledge, Character & a Better Future';
  const heroSubtitle = settings.heroSubtitle ?? 'Nizami Islamic Center offers authentic Islamic education while Nizami Education provides quality academic coaching for Classes 1–8.';
  const statsStudents = settings.statsStudents ?? '500+';
  const statsTeachers = settings.statsTeachers ?? '20+';
  const statsBranches = settings.statsBranches ?? '3+';
  const statsCourses = settings.statsCourses ?? '15+';

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0D4A28] via-[#1B6B3A] to-[#2E8B57] text-white py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#D4A017] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
              <Star className="w-4 h-4 text-[#D4A017]" />
              <span>Trusted Islamic & Academic Education</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              {heroTitle}
            </h1>
            <p className="text-lg text-green-100 mb-8 leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/islamic-center"
                className="px-6 py-3 bg-white text-[#1B6B3A] font-semibold rounded-xl hover:bg-green-50 transition"
              >
                Explore Islamic Education
              </Link>
              <Link
                href="/education"
                className="px-6 py-3 bg-[#C0392B] text-white font-semibold rounded-xl hover:bg-[#922B21] transition"
              >
                Explore Nizami Education
              </Link>
              <Link
                href="/admissions/apply"
                className="px-6 py-3 border border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition"
              >
                Apply for Admission
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'Students Enrolled', value: statsStudents, icon: Users },
              { label: 'Qualified Teachers', value: statsTeachers, icon: GraduationCap },
              { label: 'Active Branches', value: statsBranches, icon: Building2 },
              { label: 'Courses Offered', value: statsCourses, icon: BookOpen },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-12 h-12 bg-[#E8F5EE] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-[#1B6B3A]" />
                </div>
                <p className="text-3xl font-bold text-[#1A1A2E]">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Divisions Section (Dynamic from Database) */}
      <section className="py-16 bg-[#FDF6EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E]">
              {settings.divisionsSectionTitle ?? 'Our Educational Divisions'}
            </h2>
            <p className="text-gray-600 mt-2">
              {settings.divisionsSectionSubtitle ?? 'Two divisions. One mission. Comprehensive education for all.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(divisions.length > 0
              ? divisions
              : [
                  {
                    _id: 'default-nic',
                    code: 'NIC',
                    name: { en: 'Nizami Islamic Center' },
                    headTitle: 'Nazim-e-Aala: Hafiz Ahmad Raza Nizami',
                    description: {
                      en: 'Authentic Islamic education including Nazra Quran with Tajweed, Hifz, Deeni Masail, Urdu education, and more. Taught by qualified Islamic scholars under the leadership of Hazrat Hafiz o Qari Ahmad Raza Nizami.',
                    },
                    features: [
                      'Nazra Quran with Tajweed',
                      'Hifz Surah & Hadith',
                      'Deeni Masail',
                      'Masnoon Dua & Kalma',
                      'Urdu Likhna Padhna',
                    ],
                    gradientFrom: '#1B6B3A',
                    gradientTo: '#0D4A28',
                    buttonText: 'Learn More',
                    buttonUrl: '/islamic-center',
                    icon: 'book',
                  },
                  {
                    _id: 'default-ne',
                    code: 'NE',
                    name: { en: 'Nizami Education' },
                    headTitle: 'Academic Head: Sir Istekhar Ahmad',
                    description: {
                      en: 'Quality academic coaching for students from Class 1 to Class 8. Expert teachers for English, Mathematics, Science, and Basic Computer, directed and managed by Sir Istekhar Ahmad.',
                    },
                    features: [
                      'Classes 1 to 8',
                      'English & Mathematics',
                      'Science & Computer',
                      'Small Batch Learning',
                      'Regular Assessments',
                    ],
                    gradientFrom: '#C0392B',
                    gradientTo: '#922B21',
                    buttonText: 'Learn More',
                    buttonUrl: '/education',
                    icon: 'graduation-cap',
                  },
                ]
            ).map((div) => {
              const isNic = div.code === 'NIC';
              const fromColor = div.gradientFrom || (isNic ? '#1B6B3A' : '#C0392B');
              const toColor = div.gradientTo || (isNic ? '#0D4A28' : '#922B21');
              const defaultHead = isNic
                ? 'Nazim-e-Aala: Hafiz Ahmad Raza Nizami'
                : 'Academic Head: Sir Istekhar Ahmad';
              const headTitle = div.headTitle || defaultHead;
              const defaultDesc = isNic
                ? 'Authentic Islamic education including Nazra Quran with Tajweed, Hifz, Deeni Masail, Urdu education, and more. Taught by qualified Islamic scholars under the leadership of Hazrat Hafiz o Qari Ahmad Raza Nizami.'
                : 'Quality academic coaching for students from Class 1 to Class 8. Expert teachers for English, Mathematics, Science, and Basic Computer, directed and managed by Sir Istekhar Ahmad.';
              const description = div.description?.en || defaultDesc;
              const defaultFeatures = isNic
                ? [
                    'Nazra Quran with Tajweed',
                    'Hifz Surah & Hadith',
                    'Deeni Masail',
                    'Masnoon Dua & Kalma',
                    'Urdu Likhna Padhna',
                  ]
                : [
                    'Classes 1 to 8',
                    'English & Mathematics',
                    'Science & Computer',
                    'Small Batch Learning',
                    'Regular Assessments',
                  ];
              const features =
                div.features && div.features.length > 0 ? div.features : defaultFeatures;
              const buttonUrl = div.buttonUrl || (isNic ? '/islamic-center' : '/education');
              const buttonText = div.buttonText || 'Learn More';
              const iconType = div.icon || (isNic ? 'book' : 'graduation-cap');

              return (
                <div
                  key={div._id}
                  style={{
                    background: `linear-gradient(135deg, ${fromColor} 0%, ${toColor} 100%)`,
                  }}
                  className="rounded-2xl p-8 text-white flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                        {iconType === 'graduation-cap' ? (
                          <GraduationCap className="w-7 h-7 text-white" />
                        ) : iconType === 'school' ? (
                          <School className="w-7 h-7 text-white" />
                        ) : iconType === 'sparkles' ? (
                          <Sparkles className="w-7 h-7 text-white" />
                        ) : (
                          <BookOpen className="w-7 h-7 text-white" />
                        )}
                      </div>
                      {headTitle && (
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold border ${
                            isNic
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37]'
                              : 'bg-white/20 border-white/30 text-white'
                          }`}
                        >
                          {headTitle}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{div.name.en}</h3>
                    <p
                      className={`text-sm leading-relaxed mb-5 ${
                        isNic ? 'text-green-100' : 'text-red-100'
                      }`}
                    >
                      {description}
                    </p>
                    {features.length > 0 && (
                      <ul className="space-y-1.5 mb-6">
                        {features.map((c) => (
                          <li
                            key={c}
                            className={`flex items-center gap-2 text-sm ${
                              isNic ? 'text-green-100' : 'text-red-100'
                            }`}
                          >
                            <ChevronRight
                              className={`w-4 h-4 shrink-0 ${
                                isNic ? 'text-[#D4AF37]' : 'text-white'
                              }`}
                            />{' '}
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Link
                    href={buttonUrl}
                    style={{ color: fromColor }}
                    className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition w-fit shadow-sm"
                  >
                    {buttonText} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Islamic Courses */}
      {islamicCourses.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#1B6B3A] border border-emerald-200/60 text-xs font-bold uppercase tracking-wider mb-2">
                  <BookOpen className="w-3.5 h-3.5" /> Nizami Islamic Center
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E]">Quran &amp; Islamic Studies Courses</h2>
                <p className="text-gray-500 text-sm mt-1">Explore authentic Islamic programs under Hazrat Hafiz o Qari Ahmad Raza Nizami</p>
              </div>
              <Link href="/islamic-center/courses" className="text-sm font-bold text-[#1B6B3A] hover:underline flex items-center gap-1">
                View all courses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {islamicCourses.map((course) => (
                <div key={course._id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-emerald-200 transition group flex flex-col justify-between bg-white">
                  <div>
                    <div className="w-10 h-10 bg-[#E8F5EE] rounded-xl flex items-center justify-center mb-3">
                      <BookOpen className="w-5 h-5 text-[#1B6B3A]" />
                    </div>
                    <h3 className="font-bold text-[#1A1A2E] mb-1.5 group-hover:text-[#1B6B3A] transition text-lg">
                      {course.name?.en ?? ''}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                      {course.shortDescription?.en ?? 'Authentic curriculum with individual attention and practical guidance.'}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-medium">Monthly Fee</span>
                      <span className="text-sm font-bold text-[#1B6B3A]">
                        {typeof course.fee === 'number' && course.fee > 0
                          ? `₹${course.fee.toLocaleString('en-IN')}/mo`
                          : 'Contact Office'}
                      </span>
                    </div>
                    <Link
                      href={`/admissions/apply?course=${encodeURIComponent(course.slug || course.name?.en)}`}
                      className="px-4 py-2 bg-[#1B6B3A] text-white text-xs font-semibold rounded-lg hover:bg-[#0D4A28] transition flex items-center gap-1.5 shadow-sm"
                    >
                      Apply Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nizami Education Academic Classes & Programs */}
      {(neClasses.length > 0 || neCourses.length > 0) && (
        <section className="py-16 bg-slate-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#C0392B] border border-red-200/60 text-xs font-bold uppercase tracking-wider mb-2">
                  <GraduationCap className="w-3.5 h-3.5" /> Nizami Education Division
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E]">
                  School Academic Coaching &amp; Classes (1st – 8th)
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Concept-based tutoring in English, Mathematics, Science &amp; Basic Computer directed by Sir Istekhar Ahmad
                </p>
              </div>
              <Link href="/education/classes" className="text-sm font-bold text-[#C0392B] hover:underline flex items-center gap-1 shrink-0">
                View all classes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* If there are any custom NE courses, display them */}
              {neCourses.map((course) => (
                <div key={course._id} className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:shadow-lg hover:border-red-300 transition group flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-3">
                      <GraduationCap className="w-5 h-5 text-[#C0392B]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#C0392B] bg-red-50 px-2 py-0.5 rounded-full mb-2 inline-block">Academic Course</span>
                    <h3 className="font-bold text-[#1A1A2E] mb-1 group-hover:text-[#C0392B] transition text-base">
                      {course.name?.en ?? ''}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {course.shortDescription?.en || 'Comprehensive academic coaching with doubt clearance and weekly tests.'}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-medium">Monthly Fee</span>
                      <span className="text-sm font-bold text-[#C0392B]">
                        {typeof course.fee === 'number' && course.fee > 0 ? `₹${course.fee.toLocaleString('en-IN')}/mo` : 'Contact Office'}
                      </span>
                    </div>
                    <Link
                      href={`/admissions/apply?course=${encodeURIComponent(course.slug || course.name?.en)}`}
                      className="px-3.5 py-1.5 bg-[#C0392B] text-white text-xs font-semibold rounded-lg hover:bg-[#922B21] transition flex items-center gap-1 shadow-sm"
                    >
                      Apply Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}

              {/* NE Classes (Class 1 to 8) */}
              {neClasses.map((cls) => (
                <div key={cls._id} className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:shadow-lg hover:border-red-300 transition group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-[#C0392B]" />
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                        {cls.numericValue ? `Grade ${cls.numericValue}` : 'Academic'}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#1A1A2E] mb-1 group-hover:text-[#C0392B] transition text-base">
                      {cls.name?.en ?? `Class ${cls.numericValue}`}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {cls.description || 'English, Mathematics, Science & Computer. Daily doubt clearing & weekly test series.'}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-medium">Monthly Fee</span>
                      <span className="text-sm font-bold text-[#C0392B]">
                        {typeof cls.fee === 'number' && cls.fee > 0 ? `₹${cls.fee.toLocaleString('en-IN')}/mo` : '₹500/mo'}
                      </span>
                    </div>
                    <Link
                      href={`/admissions/apply?class=${encodeURIComponent(cls.slug || cls.name?.en)}`}
                      className="px-3.5 py-1.5 bg-[#C0392B] text-white text-xs font-semibold rounded-lg hover:bg-[#922B21] transition flex items-center gap-1 shadow-sm"
                    >
                      Apply Now <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Branches Section — Dynamic from DB */}
      <section className="py-16 bg-[#FDF6EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Spiritual Patron & Equal Leadership Banner */}
          <div className="bg-gradient-to-r from-[#1B6B3A] via-[#0D4A28] to-[#1B6B3A] rounded-2xl p-6 sm:p-8 text-white mb-10 shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <span className="inline-block px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold rounded-full mb-2 uppercase tracking-wide">
                  Bafaiz-e-Roohani: Huzoor Khatibulbarahin Hazrat Soofi Mohammad Nizamuddin (Alaihir Rahma)
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  نظامی اسلامک سینٹر — Nizami Islamic Centre &amp; Nizami Education
                </h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-green-100 font-medium">
                    Joint Leadership: <strong className="text-[#D4AF37]">Hazrat Hafiz o Qari Ahmad Raza Nizami</strong> (Nazim-e-Aala, Islamic Center) &amp; <strong className="text-[#D4AF37]">Sir Istekhar Ahmad</strong> (Academic Director, Nizami Education)
                  </p>
                  <p className="text-xs text-green-200">
                    Both operating equally to ensure comprehensive spiritual character and highest academic standards across all branches.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <a
                  href={`tel:${settings.phone ?? '8779282185'}`}
                  className="px-5 py-3 bg-[#D4AF37] text-gray-900 font-bold rounded-xl text-sm hover:bg-[#c49f2c] transition flex items-center gap-2 shadow"
                >
                  <Phone className="w-4 h-4" /> Call: {settings.phone ?? '8779282185'}
                </a>
                <a
                  href={`https://wa.me/${(settings.whatsapp ?? '918779282185').replace(/[^\d]/g, '')}?text=Assalamualaikum%2C%20I%20want%20to%20inquire%20about%20admission%20at%20Nizami%20Islamic%20Center`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-[#25D366] text-white font-bold rounded-xl text-sm hover:bg-[#1ebe5d] transition flex items-center gap-2 shadow"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1B6B3A]">Titwala East, Maharashtra</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mt-1">Our Branches &amp; Learning Centers</h2>
              <p className="text-gray-600 text-sm mt-1">
                Admission Open 2026/2027 • Timings: <strong>Subah, Dopahar, Sham (Morning, Afternoon, Evening)</strong>
              </p>
            </div>
            <Link href="/branches" className="text-sm font-bold text-[#1B6B3A] hover:underline flex items-center gap-1">
              All branch details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branches.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-lg hover:border-[#1B6B3A]/40 transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-[#1B6B3A] rounded-full border border-emerald-200">
                      Admission Open 2026/27
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Titwala (E)</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#1A1A2E] group-hover:text-[#1B6B3A] transition">
                    {b.name}
                  </h3>
                  {b.area && (
                    <p className="text-xs font-semibold text-[#1B6B3A] mt-0.5">{b.area}</p>
                  )}

                  {b.description?.en && (
                    <p className="text-xs text-gray-600 bg-emerald-50/60 p-2 rounded-lg my-3 leading-relaxed">
                      {b.description.en}
                    </p>
                  )}

                  <div className="space-y-2 text-xs text-gray-600 mt-3">
                    {b.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#1B6B3A] shrink-0 mt-0.5" />
                        <p className="leading-snug">{b.address}</p>
                      </div>
                    )}
                    {b.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#1B6B3A] shrink-0" />
                        <a href={`tel:${b.phone}`} className="font-semibold text-gray-800 hover:text-[#1B6B3A]">
                          {b.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md font-medium">
                      <span>Waqt / Timings:</span>
                      <strong>Subah, Dopahar, Sham</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-gray-100 flex items-center justify-between">
                  <a
                    href={`https://wa.me/${((b.whatsapp || b.phone || '').replace(/[^\d]/g, '')).length === 10 ? '91' + (b.whatsapp || b.phone || '').replace(/[^\d]/g, '') : (b.whatsapp || b.phone || '').replace(/[^\d]/g, '')}?text=${encodeURIComponent('Assalamualaikum, I am inquiring about admission at ' + b.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#1B6B3A] hover:underline inline-flex items-center gap-1"
                  >
                    Inquire on WhatsApp →
                  </a>
                  <Link
                    href="/admissions/apply"
                    className="px-3 py-1.5 rounded-lg bg-[#1B6B3A] text-white text-xs font-bold hover:bg-[#0D4A28] transition"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teachers Section — Dynamic from DB */}
      {teachers.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A2E]">Our Faculty &amp; Teachers</h2>
                <p className="text-gray-500 text-sm mt-1">Qualified educators across both divisions</p>
              </div>
              <Link href="/teachers" className="text-sm text-[#1B6B3A] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {teachers.map((t) => (
                <div
                  key={t._id}
                  className="bg-[#F8FBF9] rounded-2xl border border-gray-100 p-4 text-center hover:shadow-md hover:border-[#1B6B3A]/30 transition group"
                >
                  <div className="w-14 h-14 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold text-[#1B6B3A] group-hover:bg-[#1B6B3A] group-hover:text-white transition">
                    {t.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.photo} alt={t.name} className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <span>{t.name.charAt(0)}</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#1A1A2E] leading-snug">{t.name}</p>
                  {t.qualification && (
                    <p className="text-[10px] text-gray-500 mt-0.5 truncate">{t.qualification}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-[#1A1A2E] mb-8">What Parents & Students Say</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map((t) => (
                <div key={t._id} className="border border-gray-100 rounded-xl p-5">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D4A017] text-[#D4A017]" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    &ldquo;{t.message?.en ?? ''}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#E8F5EE] rounded-full flex items-center justify-center text-xs font-bold text-[#1B6B3A]">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A2E]">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role ?? ''}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Notices */}
      {notices.length > 0 && (
        <section className="py-16 bg-[#FDF6EC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#1A1A2E]">Latest Notices</h2>
              <Link href="/notices" className="text-sm text-[#1B6B3A] hover:underline flex items-center gap-1">
                All notices <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {notices.map((notice) => (
                <div key={notice._id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4">
                  <div className="w-2 h-2 bg-[#1B6B3A] rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="font-medium text-[#1A1A2E] text-sm">
                      {notice.title?.en ?? ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(notice.publishDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Admission CTA */}
      <section className="py-16 bg-gradient-to-r from-[#1B6B3A] to-[#0D4A28] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Join Nizami Islamic Center?</h2>
          <p className="text-green-100 mb-8 max-w-xl mx-auto">
            Take the first step toward quality education. Apply online or visit your nearest branch.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/admissions/apply"
              className="px-8 py-3 bg-white text-[#1B6B3A] font-semibold rounded-xl hover:bg-green-50 transition"
            >
              Apply for Admission
            </Link>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent('Assalamualaikum, I would like to enquire about admission at Nizami Islamic Center.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 border border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
