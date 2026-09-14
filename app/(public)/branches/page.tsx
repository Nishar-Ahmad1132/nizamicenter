import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db/mongoose';
import Branch from '@/models/Branch';
import { Building2, MapPin, Phone, Clock, ArrowRight, MessageCircle, BookOpen, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Branches in Titwala (East) | Nizami Islamic Center',
  description: 'Official branches of Nizami Islamic Center in Baneli, Titwala (East): Kokan Nagar (Near Quba Masjid), Chota Chowk (Khan Chawl), and NRC Colony (Ambivli Road). Call 8779282185.',
};

async function getBranches() {
  try {
    await dbConnect();
    const branches = await Branch.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    return JSON.parse(JSON.stringify(branches));
  } catch {
    return [];
  }
}

export default async function BranchesPage() {
  const branches = await getBranches();

  const realBranches = [
    {
      _id: 'branch-1',
      name: 'Kokan Nagar Branch (Near Quba Masjid)',
      slug: 'baneli-quba-masjid',
      subname: 'Habeeb Ansari Chawl',
      urdu: 'حسیب انصاری چال نزد قبا مسجد کوکن نگر بنیلی ٹٹوالا (ایسٹ)',
      hindi: 'हसीब अंसारी चाल नियर कुबा मस्जिद कोकण नगर बनेली टिटवाला (ई)',
      address: 'Habeeb Ansari Chawl, Near Quba Masjid, Kokan Nagar, Baneli Gaon, Titwala (East)',
      area: 'Kokan Nagar, Baneli Gaon',
      city: 'Titwala (East), Maharashtra',
      phone: '8779282185',
      whatsapp: '8779282185',
      timing: 'Subah, Dopahar, Sham (Morning, Afternoon, Evening)',
      facilities: [
        'Nazra Quran With Tajweed',
        'Hifz Hadees With Tarjama',
        'Deeni Masail & Masnoon Dua',
        'Urdu Likhna Padhna',
        'Airy & Peaceful Classroom Environment',
        'Separate Batches for Boys and Girls',
      ],
      description: {
        en: 'Located near Quba Masjid in Kokan Nagar, this center provides structured Islamic learning for children and youth under qualified Huffaz and Qaris.',
      },
    },
    {
      _id: 'branch-2',
      name: 'Chota Chowk Branch (Khan Chawl)',
      slug: 'baneli-chota-chowk',
      subname: 'Near Gupta Chawl',
      urdu: 'خان چال نزد گپتا چال چھوٹا چوک بنیلی ٹٹوالا (ایسٹ)',
      hindi: 'खान चाल नियर गुप्ता चाल छोटा चौक बनेली टिटवाला (ई)',
      address: 'Khan Chawl, Near Gupta Chawl, Chota Chowk, Baneli, Titwala (East)',
      area: 'Chota Chowk, Baneli',
      city: 'Titwala (East), Maharashtra',
      phone: '8779282185',
      whatsapp: '8779282185',
      timing: 'Subah, Dopahar, Sham (Morning, Afternoon, Evening)',
      facilities: [
        'Makharij & Tajweed Perfection',
        'Kalma With Tarjama',
        'Hifz Surah & Hadith',
        'Daily Masnoon Duas',
        'Personal One-on-One Sabaq Attention',
        'Small Group Batches',
      ],
      description: {
        en: 'Conveniently located at Chota Chowk near Gupta Chawl, offering flexible morning, afternoon, and evening sessions for school-going students.',
      },
    },
    {
      _id: 'branch-3',
      name: 'NRC Colony Branch (Ambivli Road)',
      slug: 'baneli-nrc-colony',
      subname: 'Rehbar Chawl, Hussain Nagar',
      urdu: 'رہبر چال حسین نگر، این آر سی کالونی امبیولی روڈ بنیلی ٹٹوالا (ایسٹ)',
      hindi: 'रहबर चाल हुसैन नगर एनआरसी कॉलोनी अंबिवली रोड बनेली टिटवाला (ई)',
      address: 'Rehbar Chawl, Hussain Nagar, NRC Colony, Ambivli Road, Baneli, Titwala (East)',
      area: 'Hussain Nagar, NRC Colony, Ambivli Road',
      city: 'Titwala (East), Maharashtra',
      phone: '8779282185',
      whatsapp: '8779282185',
      timing: 'Subah, Dopahar, Sham (Morning, Afternoon, Evening)',
      facilities: [
        'Foundation Qaida to Fluent Nazra',
        'Hamd-e-Bari Ta’ala & Naat Sharif',
        'Manqabat & Taqreer Training',
        'Basic Islamic Ethics & Adab',
        'Urdu Literacy Course',
        'Flexible Shift Timings',
      ],
      description: {
        en: 'Situated on Ambivli Road in NRC Colony, delivering complete Islamic syllabus, public speaking/taqreer practice, and moral training.',
      },
    },
  ];

  const displayBranches = branches.length > 0 ? branches : realBranches;

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#0D4A28] via-[#1B6B3A] to-[#0A381E] py-14 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#D4AF37] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Admission Open 2026 / 2027 (داخله جاری)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Our Branches & Learning Centers
          </h1>
          <p className="text-emerald-100 mt-2 max-w-3xl text-base sm:text-lg">
            Nizami Islamic Center operates across 3 accessible learning centers in Baneli, Titwala (East), Maharashtra.
          </p>
        </div>
      </section>

      {/* Leadership & Patronage Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-md">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1B6B3A]">Spiritual Guidance & Joint Leadership</span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                Bafaiz-e-Roohani: Huzoor Khatibulbarahin Hazrat Soofi Mohammad Nizamuddin (Alaihir Rahma)
              </h2>
              <div className="pt-1 space-y-1">
                <p className="text-sm font-bold text-gray-900">
                  Nazim-e-Aala (Islamic Center): <span className="text-[#1B6B3A]">Hazrat Hafiz o Qari Ahmad Raza Nizami</span>
                </p>
                <p className="text-sm font-bold text-gray-900">
                  Academic Director (Nizami Education): <span className="text-[#C0392B]">Sir Istekhar Ahmad</span>
                </p>
              </div>
              <p className="text-xs text-gray-600 italic">
                “Apne Bachon Ko Padhaiye, Un Ka Mustaqbil Sawariye • Makharij o Tajweed Ke Sath Apne Bache Aur Bachiyon Ko Quran Sikhne Ke Liye Zaroor Dakhla Karwayen”
              </p>
              <p className="text-xs font-medium text-emerald-800">
                Operating equally with unified management over sacred religious theology and secular school excellence.
              </p>
            </div>

            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Central Helpline Number</p>
                <a href="tel:8779282185" className="text-2xl font-extrabold text-[#1B6B3A] hover:underline">
                  8779282185
                </a>
                <p className="text-xs text-emerald-700 mt-0.5">Sessions: Subah, Dopahar, Sham</p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <a
                  href="https://wa.me/918779282185?text=Assalamualaikum%2C%20I%20am%20inquiring%20about%20admission%20at%20Nizami%20Islamic%20Center"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1ebe5d] transition shadow flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <Link
                  href="/admissions/apply"
                  className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-[#1B6B3A] text-white text-xs font-bold hover:bg-[#0D4A28] transition shadow"
                >
                  Apply Online
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branches List */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {displayBranches.map((b: any) => (
            <div
              key={b._id}
              className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 flex flex-col justify-between hover:shadow-xl hover:border-emerald-400 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1B6B3A] flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                    Titwala (East)
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#1B6B3A] transition">
                  {b.name}
                </h2>
                {b.subname && <p className="text-xs font-semibold text-[#1B6B3A] mt-0.5">{b.subname}</p>}

                {b.urdu && (
                  <p className="text-xs text-right font-medium text-emerald-900 bg-emerald-50/70 p-2.5 rounded-xl my-3 font-serif leading-relaxed" dir="rtl">
                    {b.urdu}
                  </p>
                )}

                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {b.description?.en || b.address}
                </p>

                <div className="space-y-2.5 text-xs text-gray-600 mb-6">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-gray-700">{b.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <a href={`tel:${b.phone || '8779282185'}`} className="font-bold text-gray-900 hover:text-emerald-700">
                      {b.phone || '8779282185'}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5 text-amber-900 bg-amber-50 px-2.5 py-1.5 rounded-lg font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Waqt: <strong>{b.timing || 'Subah, Dopahar, Sham'}</strong></span>
                  </div>
                </div>

                {b.facilities && b.facilities.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Syllabus & Course Offerings:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {b.facilities.map((f: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-medium"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/918779282185?text=Assalamualaikum%2C%20I%20am%20inquiring%20about%20admission%20at%20${encodeURIComponent(b.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#1B6B3A] hover:underline"
                >
                  WhatsApp Inquiry →
                </a>
                <Link
                  href="/admissions/apply"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#1B6B3A] text-white hover:bg-[#0D4A28] transition shadow"
                >
                  Apply Here
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Complete Syllabus Section */}
      <section className="py-14 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1B6B3A]">نصابِ تعلیم — Complete Islamic Syllabus</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">What We Teach Across All Branches</h2>
            <p className="text-sm text-gray-600 mt-2">Comprehensive spiritual and moral curriculum taught under certified scholars</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { en: 'Nazra Quran with Tajvid', ur: 'ناظرہ قرآن مع تجوید' },
              { en: 'Hifz Hadees with Tarjama', ur: 'حفظ حدیث مع ترجمہ' },
              { en: 'Deeni Masail', ur: 'دینی مسائل' },
              { en: 'Hifz Surah', ur: 'حفظ سورہ' },
              { en: 'Urdu Likhna Padhna', ur: 'اردو لکھنا پڑھنا' },
              { en: 'Kalma with Tarjama', ur: 'کلمہ مع ترجمہ' },
              { en: 'Masnoon Dua', ur: 'مسنون دعائیں' },
              { en: 'Hamd, Naat, Manqabat & Taqreer', ur: 'حمدِ باری تعالیٰ، نعت، منقبت، تقریر' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <p className="text-base font-bold text-[#1B6B3A] font-serif mb-1" dir="rtl">{item.ur}</p>
                <p className="text-xs font-semibold text-gray-800">{item.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
