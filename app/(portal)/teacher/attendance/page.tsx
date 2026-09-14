'use client';

import { useState } from 'react';
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle, Save, Check } from 'lucide-react';

interface StudentRow {
  id: string;
  name: string;
  rollNo: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export default function TeacherAttendancePage() {
  const [selectedBatch, setSelectedBatch] = useState('Hifz Batch A (Morning)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const [students, setStudents] = useState<StudentRow[]>([
    { id: '1', name: 'Zaid Khan', rollNo: 'NIZ-001', status: 'present' },
    { id: '2', name: 'Bilal Ahmad', rollNo: 'NIZ-002', status: 'present' },
    { id: '3', name: 'Hamza Siddiqui', rollNo: 'NIZ-003', status: 'present' },
    { id: '4', name: 'Omar Farooq', rollNo: 'NIZ-004', status: 'late' },
    { id: '5', name: 'Usman Ali', rollNo: 'NIZ-005', status: 'present' },
    { id: '6', name: 'Saad Abdullah', rollNo: 'NIZ-006', status: 'absent' },
    { id: '7', name: 'Anas Malik', rollNo: 'NIZ-007', status: 'present' },
    { id: '8', name: 'Mustafa Hashmi', rollNo: 'NIZ-008', status: 'present' },
  ]);

  const updateStatus = (id: string, status: StudentRow['status']) => {
    setStudents(students.map((s) => (s.id === id ? { ...s, status } : s)));
    setSaved(false);
  };

  const markAllPresent = () => {
    setStudents(students.map((s) => ({ ...s, status: 'present' })));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate/Post attendance
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSaved(true);
  };

  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const lateCount = students.filter((s) => s.status === 'late').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mark Batch Attendance</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Record and submit real-time attendance for your assigned class.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllPresent}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition"
          >
            Mark All Present
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition shadow flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Attendance successfully recorded in the centralized database.</span>
        </div>
      )}

      {/* Batch and Date Selectors */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Selected Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option>Hifz Batch A (Morning)</option>
            <option>Classical Arabic Grammar (Foundational)</option>
            <option>Class 10 Physics & Mathematics (Tuition)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Session Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
          </input>
        </div>

        <div className="flex items-end gap-3 text-xs">
          <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl font-bold flex-1 text-center">
            {presentCount} Present
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl font-bold flex-1 text-center">
            {lateCount} Late
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-800 rounded-xl font-bold flex-1 text-center">
            {absentCount} Absent
          </div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200/80">
                <th className="p-4">Roll No</th>
                <th className="p-4">Student Name</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-4 font-mono text-xs font-semibold text-gray-600">{student.rollNo}</td>
                  <td className="p-4 font-bold text-gray-900">{student.name}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => updateStatus(student.id, 'present')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          student.status === 'present'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => updateStatus(student.id, 'late')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          student.status === 'late'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => updateStatus(student.id, 'absent')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          student.status === 'absent'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
