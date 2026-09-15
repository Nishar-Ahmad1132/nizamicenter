'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  School,
  Sparkles,
  Award,
  CheckCircle2,
  Pencil,
  X,
  Check,
  Loader2,
  Plus,
  Trash2,
  ChevronRight,
  ArrowRight,
  Eye,
  Layers,
  Palette,
  ExternalLink,
} from 'lucide-react';

export interface DivisionItem {
  _id: string;
  name: { en: string; hi?: string; ur?: string };
  code: string;
  slug: string;
  description?: { en?: string; hi?: string; ur?: string };
  headTitle?: string;
  features?: string[];
  gradientFrom?: string;
  gradientTo?: string;
  buttonText?: string;
  buttonUrl?: string;
  icon?: string;
  isActive: boolean;
  displayOrder: number;
}

interface Props {
  initialDivisions: DivisionItem[];
  totalCourses: number;
  totalClasses: number;
}

const PRESET_THEMES = [
  { name: 'Islamic Emerald', from: '#1B6B3A', to: '#0D4A28', desc: 'Default NIC theme' },
  { name: 'Education Crimson', from: '#C0392B', to: '#922B21', desc: 'Default NE theme' },
  { name: 'Royal Navy', from: '#1E3A8A', to: '#0F172A', desc: 'Classic academic theme' },
  { name: 'Deep Violet', from: '#581C87', to: '#3B0764', desc: 'Modern prestige' },
  { name: 'Sunset Amber', from: '#B45309', to: '#78350F', desc: 'Warm traditional' },
  { name: 'Teal Cyan', from: '#0F766E', to: '#134E4A', desc: 'Fresh contemporary' },
];

export default function AdminDivisionsClient({
  initialDivisions,
  totalCourses,
  totalClasses,
}: Props) {
  const router = useRouter();
  const [divisions, setDivisions] = useState<DivisionItem[]>(initialDivisions);
  const [activeDivision, setActiveDivision] = useState<DivisionItem | null>(null);

  // Form State
  const [nameEn, setNameEn] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [headTitle, setHeadTitle] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [gradientFrom, setGradientFrom] = useState('#1B6B3A');
  const [gradientTo, setGradientTo] = useState('#0D4A28');
  const [buttonText, setButtonText] = useState('Learn More');
  const [buttonUrl, setButtonUrl] = useState('');
  const [icon, setIcon] = useState('book');
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'features' | 'style'>('content');

  function openEditModal(division: DivisionItem) {
    setActiveDivision(division);
    setNameEn(division.name?.en || '');
    setNameUr(division.name?.ur || '');
    setHeadTitle(
      division.headTitle ||
        (division.code === 'NIC'
          ? 'Nazim-e-Aala: Hafiz Ahmad Raza Nizami'
          : 'Academic Head: Sir Istekhar Ahmad')
    );
    setDescriptionEn(
      division.description?.en ||
        (division.code === 'NIC'
          ? 'Authentic Islamic education including Nazra Quran with Tajweed, Hifz, Deeni Masail, Urdu education, and more. Taught by qualified Islamic scholars under the leadership of Hazrat Hafiz o Qari Ahmad Raza Nizami.'
          : 'Quality academic coaching for students from Class 1 to Class 8. Expert teachers for English, Mathematics, Science, and Basic Computer, directed and managed by Sir Istekhar Ahmad.')
    );
    setFeatures(
      division.features && division.features.length > 0
        ? [...division.features]
        : division.code === 'NIC'
        ? ['Nazra Quran with Tajweed', 'Hifz Surah & Hadith', 'Deeni Masail', 'Masnoon Dua & Kalma', 'Urdu Likhna Padhna']
        : ['Classes 1 to 8', 'English & Mathematics', 'Science & Computer', 'Small Batch Learning', 'Regular Assessments']
    );
    setGradientFrom(division.gradientFrom || (division.code === 'NIC' ? '#1B6B3A' : '#C0392B'));
    setGradientTo(division.gradientTo || (division.code === 'NIC' ? '#0D4A28' : '#922B21'));
    setButtonText(division.buttonText || 'Learn More');
    setButtonUrl(division.buttonUrl || (division.code === 'NIC' ? '/islamic-center' : '/education'));
    setIcon(division.icon || (division.code === 'NIC' ? 'book' : 'graduation-cap'));
    setIsActive(division.isActive ?? true);
    setFeedback(null);
    setActiveTab('content');
  }

  function handleAddFeature() {
    const val = newFeatureInput.trim();
    if (!val) return;
    if (!features.includes(val)) {
      setFeatures([...features, val]);
    }
    setNewFeatureInput('');
  }

  function handleRemoveFeature(index: number) {
    setFeatures(features.filter((_, i) => i !== index));
  }

  async function handleSaveDivision() {
    if (!activeDivision) return;
    if (!nameEn.trim()) {
      setFeedback({ type: 'error', message: 'Division name in English is required.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/divisions/${activeDivision._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: {
            ...activeDivision.name,
            en: nameEn.trim(),
            ur: nameUr.trim(),
          },
          headTitle: headTitle.trim(),
          description: {
            ...activeDivision.description,
            en: descriptionEn.trim(),
          },
          features,
          gradientFrom: gradientFrom.trim(),
          gradientTo: gradientTo.trim(),
          buttonText: buttonText.trim(),
          buttonUrl: buttonUrl.trim(),
          icon,
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update division');
      }

      // Update local state
      const updatedList = divisions.map((d) =>
        d._id === activeDivision._id ? { ...d, ...data.division } : d
      );
      setDivisions(updatedList);
      setFeedback({
        type: 'success',
        message: 'Division updated successfully! Changes are live on the homepage.',
      });

      router.refresh();
      setTimeout(() => {
        setActiveDivision(null);
      }, 1200);
    } catch (err) {
      setFeedback({ type: 'error', message: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic & Deeni Divisions</h1>
          <p className="text-xs text-gray-500 mt-1">
            Customize the public division showcase cards, leader incharge titles, bullet highlights, and themes
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm transition"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-700" />
          View Live on Homepage
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </Link>
      </div>

      {/* Division Cards Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {divisions.map((div) => {
          const isNic = div.code === 'NIC';
          const fromColor = div.gradientFrom || (isNic ? '#1B6B3A' : '#C0392B');
          const toColor = div.gradientTo || (isNic ? '#0D4A28' : '#922B21');
          const head =
            div.headTitle ||
            (isNic
              ? 'Nazim-e-Aala: Hafiz Ahmad Raza Nizami'
              : 'Academic Head: Sir Istekhar Ahmad');
          const desc =
            div.description?.en ||
            (isNic
              ? 'Authentic Islamic education including Nazra Quran with Tajweed, Hifz, Deeni Masail, Urdu education, and more.'
              : 'Quality academic coaching for students from Class 1 to Class 8 in English, Mathematics, Science, and Basic Computer.');
          const feats =
            div.features && div.features.length > 0
              ? div.features
              : isNic
              ? ['Nazra Quran with Tajweed', 'Hifz Surah & Hadith', 'Deeni Masail']
              : ['Classes 1 to 8', 'English & Mathematics', 'Science & Computer'];

          return (
            <div
              key={div._id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              {/* Card Color Header Strip */}
              <div
                style={{ background: `linear-gradient(90deg, ${fromColor}, ${toColor})` }}
                className="h-3 w-full"
              />

              <div className="p-6 space-y-4 flex-1">
                {/* Badges & Meta */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-mono font-bold rounded ${
                          isNic
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        CODE: {div.code}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">/{div.slug}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{div.name.en}</h2>
                    {div.name.ur && (
                      <p className="text-xs text-gray-500 font-arabic" dir="rtl">
                        {div.name.ur}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {div.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                        Inactive
                      </span>
                    )}
                    <button
                      onClick={() => openEditModal(div)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit Division
                    </button>
                  </div>
                </div>

                {/* Incharge / Head Tag */}
                {head && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
                    <Award className="w-3.5 h-3.5 text-amber-700" />
                    <span>{head}</span>
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{desc}</p>

                {/* Key Bullet Highlights */}
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                    Card Highlights ({feats.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {feats.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700"
                      >
                        <ChevronRight className="w-3 h-3 text-emerald-600" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-gray-50/80 border-t border-gray-100 px-6 py-3.5 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300 shadow-inner"
                    style={{ background: `linear-gradient(135deg, ${fromColor}, ${toColor})` }}
                  />
                  <span>Theme: {fromColor} → {toColor}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isNic ? (
                    <>
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{totalCourses} Courses</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-3.5 h-3.5 text-red-600" />
                      <span>{totalClasses} Classes</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Division Modal */}
      {activeDivision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-bold">
                  Editing Division: {activeDivision.code}
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-1">
                  Manage & Customize {activeDivision.name.en}
                </h2>
              </div>
              <button
                onClick={() => setActiveDivision(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-gray-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'content'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                Information & Incharge
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'features'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                Bullet Highlights ({features.length})
              </button>
              <button
                onClick={() => setActiveTab('style')}
                className={`px-4 py-2.5 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === 'style'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Palette className="w-4 h-4" />
                Card Style & Button
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {/* TAB 1: Information & Incharge */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Division Name (English) *
                      </label>
                      <input
                        type="text"
                        value={nameEn}
                        onChange={(e) => setNameEn(e.target.value)}
                        placeholder="e.g. Nizami Islamic Center"
                        className="w-full text-xs px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Division Name (Urdu)
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={nameUr}
                        onChange={(e) => setNameUr(e.target.value)}
                        placeholder="نظامی اسلامک سینٹر"
                        className="w-full text-xs px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none font-arabic"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Leader / Head Incharge Badge Text
                    </label>
                    <input
                      type="text"
                      value={headTitle}
                      onChange={(e) => setHeadTitle(e.target.value)}
                      placeholder="e.g. Nazim-e-Aala: Hafiz Ahmad Raza Nizami or Academic Head: Sir Istekhar Ahmad"
                      className="w-full text-xs px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Appears in the gold/white badge on top right of the homepage card.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Division Description (Showcase Text)
                    </label>
                    <textarea
                      rows={4}
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      placeholder="Describe the courses, pedagogy, and scholars..."
                      className="w-full text-xs p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <label className="text-xs font-semibold text-gray-700">Display Status:</label>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        isActive ? 'bg-emerald-700' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-xs text-gray-600">
                      {isActive ? 'Active (Displayed on website)' : 'Hidden (Draft)'}
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: Bullet Highlights */}
              {activeTab === 'features' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Add New Bullet Point / Feature
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFeatureInput}
                        onChange={(e) => setNewFeatureInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddFeature();
                          }
                        }}
                        placeholder="e.g. Small Batch Learning, Nazra Quran, Science Lab..."
                        className="flex-1 text-xs px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-700 block mb-2">
                      Current Highlights ({features.length}):
                    </span>
                    {features.length === 0 ? (
                      <p className="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center">
                        No highlights added yet. Add items above to display them as bullet points on the card.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {features.map((feat, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                          >
                            <span className="flex items-center gap-2 font-medium text-gray-800">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                                {index + 1}
                              </span>
                              {feat}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(index)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Card Style & Button */}
              {activeTab === 'style' && (
                <div className="space-y-5">
                  {/* Preset Themes */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Choose Preset Color Palette:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {PRESET_THEMES.map((theme) => (
                        <button
                          key={theme.name}
                          type="button"
                          onClick={() => {
                            setGradientFrom(theme.from);
                            setGradientTo(theme.to);
                          }}
                          className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                            gradientFrom === theme.from && gradientTo === theme.to
                              ? 'border-emerald-700 bg-emerald-50/50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-lg shrink-0 shadow-inner"
                            style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{theme.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{theme.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Hex Codes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Gradient Start Color (Hex)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={gradientFrom}
                          onChange={(e) => setGradientFrom(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={gradientFrom}
                          onChange={(e) => setGradientFrom(e.target.value)}
                          placeholder="#1B6B3A"
                          className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Gradient End Color (Hex)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={gradientTo}
                          onChange={(e) => setGradientTo(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={gradientTo}
                          onChange={(e) => setGradientTo(e.target.value)}
                          placeholder="#0D4A28"
                          className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-xl font-mono focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Button Configuration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                        placeholder="Learn More"
                        className="w-full text-xs px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Button Link URL
                      </label>
                      <input
                        type="text"
                        value={buttonUrl}
                        onChange={(e) => setButtonUrl(e.target.value)}
                        placeholder="/islamic-center or /education"
                        className="w-full text-xs px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Icon Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Card Icon:
                    </label>
                    <div className="flex gap-3">
                      {[
                        { id: 'book', label: 'Quran / Book', icon: BookOpen },
                        { id: 'graduation-cap', label: 'Academic Cap', icon: GraduationCap },
                        { id: 'school', label: 'School Building', icon: School },
                        { id: 'sparkles', label: 'Excellence', icon: Sparkles },
                      ].map((item) => {
                        const IconComp = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setIcon(item.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition ${
                              icon === item.id
                                ? 'bg-emerald-50 border-emerald-700 text-emerald-800 shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Live Preview of Homepage Card */}
              <div className="pt-3 border-t border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                  Live Card Preview (As Seen on Homepage):
                </span>
                <div
                  style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
                  className="rounded-2xl p-6 text-white space-y-4 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      {icon === 'graduation-cap' ? (
                        <GraduationCap className="w-6 h-6 text-white" />
                      ) : icon === 'school' ? (
                        <School className="w-6 h-6 text-white" />
                      ) : icon === 'sparkles' ? (
                        <Sparkles className="w-6 h-6 text-white" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-white" />
                      )}
                    </div>
                    {headTitle && (
                      <span className="text-xs bg-white/20 border border-white/30 text-white px-3 py-1 rounded-full font-bold">
                        {headTitle}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{nameEn || 'Division Name'}</h3>
                    <p className="text-white/90 text-xs leading-relaxed mt-1.5 line-clamp-3">
                      {descriptionEn || 'Division description will appear here...'}
                    </p>
                  </div>
                  {features.length > 0 && (
                    <ul className="space-y-1 text-xs text-white/90">
                      {features.slice(0, 4).map((f, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div
                    style={{ color: gradientFrom }}
                    className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg font-semibold text-xs shadow-sm"
                  >
                    {buttonText} <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setActiveDivision(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveDivision}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Save Changes & Publish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
