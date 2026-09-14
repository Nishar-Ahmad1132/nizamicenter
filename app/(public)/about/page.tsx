import { Metadata } from 'next';
import Link from 'next/link';
import { Award, BookOpen, Users, CheckCircle, HeartHandshake, Compass, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Nizami Islamic Center & Nizami Education',
  description: 'Learn about our heritage, mission, leadership, and dual commitment to comprehensive Islamic theology and modern academic excellence.',
};

export default function AboutPage() {
  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#0D4A28] via-[#1B6B3A] to-[#0A381E] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-6">
            <Compass className="w-4 h-4" /> Rooted in Faith, Striving for Excellence
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Nurturing Moral Character & Academic Brilliance
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
            Nizami Islamic Center and Nizami Education stand as a unified beacon of holistic development, merging sacred traditional Islamic scholarship with premier contemporary academics.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1B6B3A] flex items-center justify-center mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To cultivate generations of spiritually grounded, intellectually upright, and socially proactive leaders who embody ethical values and achieve excellence across secular sciences and traditional Islamic knowledge.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#D4AF37] flex items-center justify-center mb-6">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To deliver an exceptional, accessible educational ecosystem blending authenticated Qur’anic memorization, Arabic fluency, and Islamic studies with standardized high-school and college academic coaching under expert mentorship.
            </p>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Why Nizami Stands Apart</h2>
            <p className="mt-3 text-gray-600">The core principles guiding our pedagogy and student care</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Dual Syllabus Synergy',
                desc: 'Balanced study plans allowing students to pursue standard academic degrees alongside authentic Islamic learning.',
              },
              {
                icon: Users,
                title: 'Certified Faculty',
                desc: 'Experienced Muftis, Huffaz, and postgraduate subject-matter educators dedicated to personal student mentorship.',
              },
              {
                icon: Award,
                title: 'Proven Track Record',
                desc: 'Consistently high academic pass percentages, Hifz completions, and ethical community leadership alumni.',
              },
              {
                icon: HeartHandshake,
                title: 'Values & Discipline',
                desc: 'An inspiring Islamic atmosphere emphasizing Adab (manners), discipline, civic integrity, and empathy.',
              },
            ].map((pillar, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition">
                <div className="w-10 h-10 rounded-lg bg-[#1B6B3A]/10 text-[#1B6B3A] flex items-center justify-center mb-4">
                  <pillar.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{pillar.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones / Key Stats */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#0D4A28] to-[#1B6B3A] rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/20">
            <div className="pt-4 sm:pt-0">
              <p className="text-4xl sm:text-5xl font-extrabold text-[#D4AF37]">1,500+</p>
              <p className="mt-2 text-sm text-emerald-100 font-medium">Students Enrolled</p>
            </div>
            <div className="pt-4 sm:pt-0">
              <p className="text-4xl sm:text-5xl font-extrabold text-[#D4AF37]">150+</p>
              <p className="mt-2 text-sm text-emerald-100 font-medium">Huffaz Graduated</p>
            </div>
            <div className="pt-4 sm:pt-0">
              <p className="text-4xl sm:text-5xl font-extrabold text-[#D4AF37]">45+</p>
              <p className="mt-2 text-sm text-emerald-100 font-medium">Qualified Teachers</p>
            </div>
            <div className="pt-4 sm:pt-0">
              <p className="text-4xl sm:text-5xl font-extrabold text-[#D4AF37]">4</p>
              <p className="mt-2 text-sm text-emerald-100 font-medium">Active Branches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Joint Leadership Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1B6B3A]">Institutional Leadership</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">Guided by Equal, Dedicated Leadership</h2>
          <p className="mt-3 text-gray-600 text-sm">
            Nizami Islamic Center and Nizami Education operate under the unified, equal guidance of two distinguished educators committed to moral character and academic brilliance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#1B6B3A] flex items-center justify-center font-bold text-2xl">
                  ق
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Hazrat Hafiz o Qari Ahmad Raza Nizami</h3>
                  <p className="text-xs font-bold text-[#1B6B3A] uppercase tracking-wide">Nazim-e-Aala — Nizami Islamic Center</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Leading the Islamic theological division with extensive scholarship in Qur’anic memorization (Hifz), verified Tajweed articulation, Hadith comprehension, and character tarbiyah for boys and girls.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 text-xs text-emerald-800 font-semibold">
              Overseeing Hifz, Nazra, Tajweed, Deeni Masail & Urdu Education
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-red-100 text-[#C0392B] flex items-center justify-center font-bold text-2xl">
                  I
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Sir Istekhar Ahmad</h3>
                  <p className="text-xs font-bold text-[#C0392B] uppercase tracking-wide">Academic Director — Nizami Education</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Directing the school and college academic coaching division with over 15 years of pedagogical experience, managing curriculum rigor, teacher performance, small-batch mentoring, and board examination success.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 text-xs text-red-800 font-semibold">
              Overseeing Classes 1–8 Coaching, Mathematics, Science, English & Testing
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white text-center border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Growing Academic Family</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Give your child the lifelong blessing of sound Islamic values coupled with stellar academic achievements.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/admissions/apply"
              className="px-6 py-3 rounded-xl bg-[#1B6B3A] text-white font-semibold hover:bg-[#0D4A28] transition shadow-md"
            >
              Apply for Admission
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Contact Our Counselors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
