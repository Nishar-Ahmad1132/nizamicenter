import dbConnect from '@/lib/db/mongoose';
import Branch from '@/models/Branch';
import Course from '@/models/Course';
import Teacher from '@/models/Teacher';
import Testimonial from '@/models/Testimonial';
import Notice from '@/models/Notice';
import WebsiteSetting from '@/models/WebsiteSetting';
import { GraduationCap, BookOpen, Users, Building2, Star, ArrowRight, Phone, MapPin, ChevronRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

// Plain serializable types for the view layer
type PlainCourse = { _id: string; name: { en: string }; slug: string; fee?: number; shortDescription?: { en?: string } };
type PlainBranch = { _id: string; name: string; slug: string; area?: string; city?: string; phone?: string };
type PlainTestimonial = { _id: string; name: string; role?: string; message: { en?: string }; rating?: number };
type PlainNotice = { _id: string; title: { en: string }; publishDate: string };

export const metadata: Metadata = {
  title: 'Nizami Islamic Center & Nizami Education — Quality Education in Titwala',
  description:
    'Nizami Islamic Center offers Quran, Tajweed, Hifz & Islamic education. Nizami Education provides academic coaching for Classes 1–8 including Maths, Science, English & Computer.',
  alternates: { canonical: '/' },
};

async function getHomeData() {
  try {
    await dbConnect();
    const [branches, islamicCourses, _eduCourses, _teachers, testimonials, notices, settings] = await Promise.all([
      Branch.find({ isActive: true }).sort({ displayOrder: 1 }).limit(6).lean(),
      Course.find({ isActive: true, status: 'active', featured: true })
        .populate('divisionId', 'slug')
        .sort({ displayOrder: 1 })
        .limit(6)
        .lean(),
      Course.find({ isActive: true, status: 'active' })
        .sort({ displayOrder: 1 })
        .limit(8)
        .lean(),
      Teacher.find({ isActive: true, status: 'active', isPublic: true })
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
    ]);

    const settingsMap: Record<string, string> = {};
    for (const s of settings) settingsMap[s.key] = s.value;

    // Serialize to plain objects (removes ObjectIds, Dates become strings)
    const ser = (arr: unknown[]) => JSON.parse(JSON.stringify(arr));

    return {
      branches: ser(branches) as PlainBranch[],
      islamicCourses: ser(islamicCourses) as PlainCourse[],
      testimonials: ser(testimonials) as PlainTestimonial[],
      notices: ser(notices) as PlainNotice[],
      settings: settingsMap,
    };
  } catch {
    return { branches: [], islamicCourses: [], testimonials: [], notices: [], settings: {} };
  }
}

export default async function HomePage() {
  const { branches, islamicCourses, testimonials, notices, settings } = await getHomeData();

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

      {/* Two Divisions */}
      <section className="py-16 bg-[#FDF6EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E]">Our Educational Divisions</h2>
            <p className="text-gray-600 mt-2">Two divisions. One mission. Comprehensive education for all.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Islamic Center Card */}
            <div className="bg-gradient-to-br from-[#1B6B3A] to-[#0D4A28] rounded-2xl p-8 text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <span className="text-xs bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] px-3 py-1 rounded-full font-bold">
                    Nazim-e-Aala: Hafiz Ahmad Raza Nizami
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Nizami Islamic Center</h3>
                <p className="text-green-100 text-sm leading-relaxed mb-5">
                  Authentic Islamic education including Nazra Quran with Tajweed, Hifz, Deeni Masail, Urdu education, and more. Taught by qualified Islamic scholars under the leadership of Hazrat Hafiz o Qari Ahmad Raza Nizami.
                </p>
                <ul className="space-y-1.5 mb-6">
                  {['Nazra Quran with Tajweed', 'Hifz Surah & Hadith', 'Deeni Masail', 'Masnoon Dua & Kalma', 'Urdu Likhna Padhna'].map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-green-100">
                      <ChevronRight className="w-4 h-4 text-[#D4AF37]" /> {c}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/islamic-center"
                className="inline-flex items-center gap-2 bg-white text-[#1B6B3A] px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-50 transition w-fit"
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Education Card */}
            <div className="bg-gradient-to-br from-[#C0392B] to-[#922B21] rounded-2xl p-8 text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <span className="text-xs bg-white/20 border border-white/30 text-white px-3 py-1 rounded-full font-bold">
                    Academic Head: Sir Istekhar Ahmad
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Nizami Education</h3>
                <p className="text-red-100 text-sm leading-relaxed mb-5">
                  Quality academic coaching for students from Class 1 to Class 8. Expert teachers for English, Mathematics, Science, and Basic Computer, directed and managed by Sir Istekhar Ahmad.
                </p>
                <ul className="space-y-1.5 mb-6">
                  {['Classes 1 to 8', 'English & Mathematics', 'Science & Computer', 'Small Batch Learning', 'Regular Assessments'].map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-red-100">
                      <ChevronRight className="w-4 h-4" /> {c}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/education"
                className="inline-flex items-center gap-2 bg-white text-[#C0392B] px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-50 transition w-fit"
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {islamicCourses.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A2E]">Our Courses & Programs</h2>
                <p className="text-gray-500 text-sm mt-1">Explore our featured educational programs</p>
              </div>
              <Link href="/islamic-center/courses" className="text-sm text-[#1B6B3A] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {islamicCourses.map((course) => (
                <div key={course._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition group">
                  <div className="w-10 h-10 bg-[#E8F5EE] rounded-lg flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5 text-[#1B6B3A]" />
                  </div>
                  <h3 className="font-semibold text-[#1A1A2E] mb-1 group-hover:text-[#1B6B3A] transition">
                    {course.name?.en ?? ''}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {course.shortDescription?.en ?? ''}
                  </p>
                  {typeof course.fee === 'number' && course.fee > 0 && (
                    <p className="text-sm font-semibold text-[#1B6B3A]">₹{course.fee.toLocaleString('en-IN')}/month</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Branches Section */}
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
                  نظامی اسلامک سینٹر — Nizami Islamic Centre & Nizami Education
                </h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-green-100 font-medium">
                    Joint Leadership: <strong className="text-[#D4AF37]">Hazrat Hafiz o Qari Ahmad Raza Nizami</strong> (Nazim-e-Aala, Islamic Center) & <strong className="text-[#D4AF37]">Sir Istekhar Ahmad</strong> (Academic Director, Nizami Education)
                  </p>
                  <p className="text-xs text-green-200">
                    Both operating equally to ensure comprehensive spiritual character and highest academic standards across all branches.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <a
                  href="tel:8779282185"
                  className="px-5 py-3 bg-[#D4AF37] text-gray-900 font-bold rounded-xl text-sm hover:bg-[#c49f2c] transition flex items-center gap-2 shadow"
                >
                  <Phone className="w-4 h-4" /> Call: 8779282185
                </a>
                <a
                  href="https://wa.me/918779282185?text=Assalamualaikum%2C%20I%20want%20to%20inquire%20about%20admission%20at%20Nizami%20Islamic%20Center"
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
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mt-1">Our Branches & Learning Centers</h2>
              <p className="text-gray-600 text-sm mt-1">
                Admission Open 2026/2027 • Timings: <strong>Subah, Dopahar, Sham (Morning, Afternoon, Evening)</strong>
              </p>
            </div>
            <Link href="/branches" className="text-sm font-bold text-[#1B6B3A] hover:underline flex items-center gap-1">
              All branch details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: 'branch-1',
                slug: 'baneli-quba-masjid',
                name: 'Kokan Nagar Branch',
                subname: 'Near Quba Masjid',
                urdu: 'حسیب انصاری چال نزد قبا مسجد کوکن نگر بنیلی ٹٹوالا (ایسٹ)',
                hindi: 'हसीब अंसारी चाल नियर कुबा मस्जिद कोकण नगर बनेली टिटवाला (ई)',
                address: 'Habeeb Ansari Chawl, Near Quba Masjid, Kokan Nagar, Baneli Gaon, Titwala (East)',
                phone: '8779282185',
                time: 'Subah, Dopahar, Sham',
              },
              {
                id: 'branch-2',
                slug: 'baneli-chota-chowk',
                name: 'Chota Chowk Branch',
                subname: 'Khan Chawl',
                urdu: 'خان چال نزد گپتا چال چھوٹا چوک بنیلی ٹٹوالا (ایسٹ)',
                hindi: 'खान चाल नियर गुप्ता चाल छोटा चौक बनेली टिटवाला (ई)',
                address: 'Khan Chawl, Near Gupta Chawl, Chota Chowk, Baneli, Titwala (East)',
                phone: '8779282185',
                time: 'Subah, Dopahar, Sham',
              },
              {
                id: 'branch-3',
                slug: 'baneli-nrc-colony',
                name: 'NRC Colony Branch',
                subname: 'Ambivli Road',
                urdu: 'رہبر چال حسین نگر، این آر سی کالونی امبیولی روڈ بنیلی ٹٹوالا (ایسٹ)',
                hindi: 'रहबर चाल हुसैन नगर एनआरसी कॉलोनी अंबिवली रोड बनेली टिटवाला (ई)',
                address: 'Rehbar Chawl, Hussain Nagar, NRC Colony, Ambivli Road, Baneli, Titwala (East)',
                phone: '8779282185',
                time: 'Subah, Dopahar, Sham',
              },
            ].map((b) => (
              <div
                key={b.id}
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
                  <p className="text-xs font-semibold text-[#1B6B3A]">{b.subname}</p>

                  <p className="text-xs text-right font-medium text-emerald-800 bg-emerald-50/60 p-2 rounded-lg my-3 font-serif" dir="rtl">
                    {b.urdu}
                  </p>

                  <div className="space-y-2 text-xs text-gray-600 mt-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#1B6B3A] shrink-0 mt-0.5" />
                      <p className="leading-snug">{b.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#1B6B3A] shrink-0" />
                      <a href={`tel:${b.phone}`} className="font-semibold text-gray-800 hover:text-[#1B6B3A]">
                        {b.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md font-medium">
                      <span>Waqt / Timings:</span>
                      <strong>{b.time}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-gray-100 flex items-center justify-between">
                  <a
                    href={`https://wa.me/918779282185?text=Assalamualaikum%2C%20I%20am%20inquiring%20about%20admission%20at%20${encodeURIComponent(b.name)}`}
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
