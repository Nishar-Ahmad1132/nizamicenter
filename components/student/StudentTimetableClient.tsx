'use client';

import { useState, useMemo } from 'react';
import { Clock, Calendar, MapPin, User, GraduationCap, Sparkles } from 'lucide-react';

export interface StudentScheduleSlot {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
  status: string;
  branchId?: { _id: string; name: string };
  divisionId?: { _id: string; name: { en: string }; code: string; slug: string };
  classId?: { _id: string; name: { en: string } | string };
  courseId?: { _id: string; name: { en: string } | string };
  subjectId?: { _id: string; name: { en: string } | string };
  teacherId?: { _id: string; name: string; title?: string };
}

function getLocalizedName(val: unknown): string {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'en' in (val as Record<string, unknown>)) {
    return String((val as Record<string, unknown>).en || '—');
  }
  return '—';
}

export default function StudentTimetableClient({
  slots,
  studentName,
  campusName,
}: {
  slots: StudentScheduleSlot[];
  studentName?: string;
  campusName?: string;
}) {
  const [divisionFilter, setDivisionFilter] = useState<'all' | 'nic' | 'ne'>('all');

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const isNic = slot.divisionId?.code === 'NIC' || slot.divisionId?.slug?.includes('islamic');
      if (divisionFilter === 'nic' && !isNic) return false;
      if (divisionFilter === 'ne' && isNic) return false;
      return true;
    });
  }, [slots, divisionFilter]);

  // Group slots by day
  const scheduleByDay = useMemo(() => {
    const map: Record<string, StudentScheduleSlot[]> = {};
    for (const d of days) {
      map[d.key] = [];
    }
    for (const slot of filteredSlots) {
      const dayKey = slot.day.toLowerCase();
      if (!map[dayKey]) map[dayKey] = [];
      map[dayKey].push(slot);
    }
    return map;
  }, [filteredSlots, days]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0D4A28] to-[#1B6B3A] rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-[#D4AF37] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Real-Time Weekly Schedule
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">Class & Batch Timetable</h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Active timetable for {studentName || 'Student'} • Campus: {campusName || 'Main Branch'}
            </p>
          </div>

          {/* Division Switcher */}
          <div className="flex items-center gap-1.5 bg-black/20 p-1.5 rounded-xl self-start sm:self-auto border border-white/10">
            <button
              type="button"
              onClick={() => setDivisionFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                divisionFilter === 'all'
                  ? 'bg-white text-[#1B6B3A] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              All Programs
            </button>
            <button
              type="button"
              onClick={() => setDivisionFilter('nic')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                divisionFilter === 'nic'
                  ? 'bg-white text-[#1B6B3A] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              🕌 Islamic Center
            </button>
            <button
              type="button"
              onClick={() => setDivisionFilter('ne')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                divisionFilter === 'ne'
                  ? 'bg-white text-[#1B6B3A] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              📚 Nizami Education
            </button>
          </div>
        </div>
      </div>

      {/* Day Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {days.map(({ key, label }) => {
          const daySlots = scheduleByDay[key] || [];

          return (
            <div
              key={key}
              className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#1B6B3A]" /> {label}
                  </h2>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      daySlots.length > 0
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-gray-400 bg-gray-50'
                    }`}
                  >
                    {daySlots.length} {daySlots.length === 1 ? 'Session' : 'Sessions'}
                  </span>
                </div>

                {daySlots.length === 0 ? (
                  <div className="py-8 text-center">
                    <Clock className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No sessions scheduled for this day</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {daySlots.map((slot) => {
                      const isNic =
                        slot.divisionId?.code === 'NIC' ||
                        slot.divisionId?.slug?.includes('islamic');

                      const title =
                        getLocalizedName(slot.courseId?.name) !== '—'
                          ? getLocalizedName(slot.courseId?.name)
                          : getLocalizedName(slot.subjectId?.name) !== '—'
                          ? `${getLocalizedName(slot.subjectId?.name)} (${getLocalizedName(slot.classId?.name)})`
                          : getLocalizedName(slot.classId?.name);

                      return (
                        <div
                          key={slot._id}
                          className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 hover:border-emerald-200 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-xs">{title}</span>
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    isNic
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {isNic ? 'Islamic' : 'Education'}
                                </span>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-white border border-gray-200 px-2.5 py-0.5 rounded-lg shrink-0">
                              {slot.startTime} – {slot.endTime}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-slate-200/60">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-gray-400" />
                              {slot.teacherId?.name || 'Faculty Member'}
                            </span>
                            <span className="flex items-center gap-1 font-medium text-gray-700">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {slot.room || slot.branchId?.name || 'Main Hall'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
