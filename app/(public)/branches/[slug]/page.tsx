import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db/mongoose';
import Branch from '@/models/Branch';
import { Building2, MapPin, Phone, Clock, CheckCircle2, ArrowLeft, MessageCircle } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, ' ').toUpperCase()} | Nizami Islamic Center`,
    description: `Details, location, facilities, and contact information for Nizami Islamic Center branch in Baneli, Titwala (East)`,
  };
}

const branchMap: Record<string, {
  name: string;
  subname: string;
  urdu: string;
  hindi: string;
  address: string;
  city: string;
  phone: string;
  timing: string;
  description: string;
  facilities: string[];
}> = {
  'baneli-quba-masjid': {
    name: 'Kokan Nagar Branch (Near Quba Masjid)',
    subname: 'Habeeb Ansari Chawl',
    urdu: 'حسیب انصاری چال نزد قبا مسجد کوکن نگر بنیلی ٹٹوالا (ایسٹ)',
    hindi: 'हसीब अंसारी चाल नियर कुबा मस्जिद कोकण नगर बनेली टिटवाला (ई)',
    address: 'Habeeb Ansari Chawl, Near Quba Masjid, Kokan Nagar, Baneli Gaon, Titwala (East)',
    city: 'Titwala (East), Maharashtra',
    phone: '8779282185',
    timing: 'Subah, Dopahar, Sham (Morning, Afternoon, Evening)',
    description: 'Located in Kokan Nagar near Quba Masjid, this branch specializes in Nazra Quran with Tajweed, Hifz, Hadith memorization with translation, and Urdu literacy.',
    facilities: [
      'Nazra Quran with Tajvid',
      'Hifz Hadees with Tarjama',
      'Deeni Masail',
      'Hifz Surah',
      'Urdu Likhna Padhna',
      'Kalma with Tarjama',
      'Masnoon Dua',
      'Hamd-e-Bari Taala, Naat & Taqreer',
    ],
  },
  'baneli-chota-chowk': {
    name: 'Chota Chowk Branch (Khan Chawl)',
    subname: 'Near Gupta Chawl',
    urdu: 'خان چال نزد گپتا چال چھوٹا چوک بنیلی ٹٹوالا (ایسٹ)',
    hindi: 'खान चाल नियर गुप्ता चाल छोटा चौक बनेली टिटवाला (ई)',
    address: 'Khan Chawl, Near Gupta Chawl, Chota Chowk, Baneli, Titwala (East)',
    city: 'Titwala (East), Maharashtra',
    phone: '8779282185',
    timing: 'Subah, Dopahar, Sham (Morning, Afternoon, Evening)',
    description: 'Situated at Chota Chowk near Gupta Chawl in Baneli, this center offers personalized attention for beginners and advanced Quranic students alike.',
    facilities: [
      'Nazra Quran with Tajvid',
      'Hifz Hadees with Tarjama',
      'Deeni Masail',
      'Hifz Surah',
      'Urdu Likhna Padhna',
      'Kalma with Tarjama',
      'Masnoon Dua',
      'Hamd-e-Bari Taala, Naat & Taqreer',
    ],
  },
  'baneli-nrc-colony': {
    name: 'NRC Colony Branch (Ambivli Road)',
    subname: 'Rehbar Chawl, Hussain Nagar',
    urdu: 'رہبر چال حسین نگر، این آر سی کالونی امبیولی روڈ بنیلی ٹٹوالا (ایسٹ)',
    hindi: 'रहबर चाल हुसैन नगर एनआरसी कॉलोनी अंबिवली रोड बनेली टिटवाला (ई)',
    address: 'Rehbar Chawl, Hussain Nagar, NRC Colony, Ambivli Road, Baneli, Titwala (East)',
    city: 'Titwala (East), Maharashtra',
    phone: '8779282185',
    timing: 'Subah, Dopahar, Sham (Morning, Afternoon, Evening)',
    description: 'Located in Hussain Nagar, NRC Colony on Ambivli Road, this learning center delivers comprehensive Islamic curriculum, moral tarbiyah, and public address training.',
    facilities: [
      'Nazra Quran with Tajvid',
      'Hifz Hadees with Tarjama',
      'Deeni Masail',
      'Hifz Surah',
      'Urdu Likhna Padhna',
      'Kalma with Tarjama',
      'Masnoon Dua',
      'Hamd-e-Bari Taala, Naat & Taqreer',
    ],
  },
};

export default async function BranchDetailPage({ params }: Props) {
  const { slug } = await params;
  await dbConnect();
  
  const branchDb = await Branch.findOne({ slug, isActive: true }).lean();

  const fallback = branchMap[slug] || {
    name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    subname: 'Nizami Center',
    urdu: 'نظامی اسلامک سینٹر بنیلی ٹٹوالا',
    hindi: 'निज़ामी इस्लामिक सेंटर बनेली टिटवाला',
    address: 'Baneli Gaon, Titwala (East), Maharashtra',
    city: 'Titwala (East), Maharashtra',
    phone: '8779282185',
    timing: 'Subah, Dopahar, Sham (Morning, Afternoon, Evening)',
    description: 'Quality Islamic education center providing Tajweed, Hifz, and Deeni Masail.',
    facilities: [
      'Nazra Quran with Tajvid',
      'Hifz Hadees with Tarjama',
      'Deeni Masail',
      'Hifz Surah',
      'Urdu Likhna Padhna',
      'Kalma with Tarjama',
      'Masnoon Dua',
    ],
  };

  const branch = branchDb ? {
    name: branchDb.name,
    subname: branchDb.area || fallback.subname,
    urdu: fallback.urdu,
    hindi: fallback.hindi,
    address: branchDb.address || fallback.address,
    city: branchDb.city ? `${branchDb.city}, ${branchDb.state || 'Maharashtra'}` : fallback.city,
    phone: branchDb.phone || '8779282185',
    timing: fallback.timing,
    description: branchDb.description?.en || fallback.description,
    facilities: (branchDb.facilities && branchDb.facilities.length > 0) ? branchDb.facilities : fallback.facilities,
  } : fallback;

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      {/* Top Header */}
      <section className="bg-gradient-to-br from-[#0D4A28] to-[#1B6B3A] py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link
            href="/branches"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:underline mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Branches
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {branch.name}
          </h1>
          <p className="text-emerald-100 mt-2 text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            {branch.address}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Details & Syllabus */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">About This Branch</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {branch.description}
              </p>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-sm text-right font-medium text-emerald-900 font-serif leading-relaxed" dir="rtl">
                  {branch.urdu}
                </p>
                <p className="text-xs text-emerald-800 mt-2 font-medium">
                  {branch.hindi}
                </p>
              </div>
            </div>

            {/* Syllabus Taught */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">نصابِ تعلیم — Complete Course Syllabus</h2>
                  <p className="text-xs text-gray-500 mt-1">Full curriculum taught with individual student progression</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {branch.facilities.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-5 h-5 text-[#1B6B3A] shrink-0" />
                    <span className="text-sm font-semibold text-gray-800">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Contact, Timing, & Helpline */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm">
              <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                Admission Open 2026/2027
              </span>

              <h3 className="text-lg font-bold text-gray-900 mt-4 mb-4">Branch Contact & Desk</h3>
              <div className="space-y-3.5 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#1B6B3A] shrink-0" />
                  <a href={`tel:${branch.phone}`} className="font-extrabold text-gray-900 text-base hover:text-[#1B6B3A]">
                    {branch.phone}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#1B6B3A] shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">{branch.address}</span>
                </div>
                <div className="flex items-center gap-3 text-xs bg-amber-50 p-2.5 rounded-lg text-amber-900 font-medium">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Waqt: <strong>{branch.timing}</strong></span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2.5">
                <a
                  href={`https://wa.me/918779282185?text=Assalamualaikum%2C%20I%20am%20inquiring%20about%20admission%20at%20${encodeURIComponent(branch.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-3 px-4 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#1ebe5d] transition shadow flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Inquiry
                </a>

                <Link
                  href="/admissions/apply"
                  className="w-full block text-center py-3 px-4 rounded-xl bg-[#1B6B3A] text-white font-bold text-sm hover:bg-[#0D4A28] transition shadow"
                >
                  Apply to this Branch
                </Link>
              </div>
            </div>

            {/* Leadership Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-3">
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block">
                Joint Leadership & Administration
              </span>
              <div className="space-y-1.5 border-b border-white/10 pb-3">
                <h4 className="font-bold text-sm text-white">
                  Nazim-e-Aala: Hazrat Hafiz o Qari Ahmad Raza Nizami
                </h4>
                <p className="text-xs text-emerald-400 font-medium">
                  Head of Nizami Islamic Center
                </p>
              </div>
              <div className="space-y-1.5 border-b border-white/10 pb-3">
                <h4 className="font-bold text-sm text-white">
                  Academic Director: Sir Istekhar Ahmad
                </h4>
                <p className="text-xs text-blue-400 font-medium">
                  Head of Nizami Education
                </p>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed italic">
                Bafaiz-e-Roohani: Huzoor Khatibulbarahin Hazrat Soofi Mohammad Nizamuddin (Alaihir Rahma)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
