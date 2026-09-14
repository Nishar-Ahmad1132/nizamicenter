import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import Link from 'next/link';
import { Users, CalendarCheck, Clock, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';

export default async function TeacherDashboardPage() {
  const session = await auth();
  await dbConnect();

  const totalStudents = await Student.countDocuments({ status: 'active' });

  const assignedBatches = [
    { name: 'Hifz Batch A (Morning)', timing: '07:30 AM - 09:30 AM', strength: 18, room: 'Hall 1' },
    { name: 'Classical Arabic Grammar (Foundational)', timing: '10:00 AM - 11:30 AM', strength: 22, room: 'Room 204' },
    { name: 'Class 10 Physics & Mathematics (Tuition)', timing: '04:30 PM - 06:30 PM', strength: 25, room: 'Room 102' },
  ];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-white/10 rounded-full border border-white/20 text-blue-200">
              Instructor Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
              Faculty & Class Management
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Track student attendance, daily batch routines, and academic deliverables.
            </p>
          </div>

          <div>
            <Link
              href="/teacher/attendance"
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-white text-blue-900 hover:bg-blue-50 transition shadow inline-flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4 text-blue-700" /> Mark Today’s Attendance
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Assigned Students</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalStudents > 0 ? totalStudents : 65}</p>
          <p className="text-[11px] text-emerald-600 mt-1">Active across 3 batches</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Today’s Classes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">3 Sessions</p>
          <p className="text-[11px] text-gray-400 mt-1">Morning & Evening</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Attendance Verified</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">2 / 3</p>
          <p className="text-[11px] text-amber-700 mt-1">1 session pending today</p>
        </div>
      </div>

      {/* Batches & Quick Attendance Links */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Assigned Batches</h2>
            <p className="text-xs text-gray-500 mt-0.5">Click any batch to launch the rapid attendance marker</p>
          </div>
          <Link
            href="/teacher/attendance"
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
          >
            Mark All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {assignedBatches.map((b, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:border-blue-300 transition"
            >
              <div>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  {b.room}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-2.5 mb-1">{b.name}</h3>
                <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {b.timing}
                </p>
                <p className="text-xs text-gray-600 font-medium">
                  Enrollment: <strong>{b.strength} Students</strong>
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200">
                <Link
                  href="/teacher/attendance"
                  className="w-full inline-block text-center py-2 px-3 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition"
                >
                  Take Attendance
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
