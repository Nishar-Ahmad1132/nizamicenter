import dbConnect from '@/lib/db/mongoose';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import Branch from '@/models/Branch';
import Course from '@/models/Course';
import AdmissionApplication from '@/models/AdmissionApplication';
import FeeRecord from '@/models/FeeRecord';
import Attendance from '@/models/Attendance';
import {
  Users, UserCheck, Building2, BookOpen,
  ClipboardList, DollarSign, TrendingUp, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import DashboardCharts from '@/components/admin/DashboardCharts';

async function getDashboardStats() {
  await dbConnect();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [totalStudents, activeStudents, totalTeachers, totalBranches, totalCourses,
    newApplications, todayAttendance, pendingFees, monthFeeRecords] = await Promise.all([
    Student.countDocuments({ isActive: true }),
    Student.countDocuments({ isActive: true, status: 'active' }),
    Teacher.countDocuments({ isActive: true, status: 'active' }),
    Branch.countDocuments({ isActive: true }),
    Course.countDocuments({ isActive: true, status: 'active' }),
    AdmissionApplication.countDocuments({ status: 'pending' }),
    Attendance.countDocuments({ date: { $gte: today } }),
    FeeRecord.countDocuments({ status: { $in: ['pending', 'partial'] }, isActive: true }),
    FeeRecord.find({ status: 'paid', isActive: true, dueDate: { $gte: monthStart } })
      .select('paidAmount').lean(),
  ]);

  const monthCollection = monthFeeRecords.reduce((sum: number, r: { paidAmount: number }) => sum + r.paidAmount, 0);

  return {
    totalStudents, activeStudents, totalTeachers, totalBranches, totalCourses,
    newApplications, todayAttendance, pendingFees, monthCollection
  };
}

const statCards = [
  { key: 'totalStudents', label: 'Total Students', icon: Users, color: 'bg-blue-500', href: '/admin/students' },
  { key: 'activeStudents', label: 'Active Students', icon: UserCheck, color: 'bg-green-500', href: '/admin/students?status=active' },
  { key: 'totalTeachers', label: 'Teachers', icon: UserCheck, color: 'bg-purple-500', href: '/admin/teachers' },
  { key: 'totalBranches', label: 'Branches', icon: Building2, color: 'bg-orange-500', href: '/admin/branches' },
  { key: 'totalCourses', label: 'Courses', icon: BookOpen, color: 'bg-teal-500', href: '/admin/courses' },
  { key: 'newApplications', label: 'New Applications', icon: ClipboardList, color: 'bg-yellow-500', href: '/admin/admissions' },
  { key: 'pendingFees', label: 'Pending Fees (Students)', icon: AlertCircle, color: 'bg-red-500', href: '/admin/fees/records?status=pending' },
];

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatDate(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/students/add"
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition"
          >
            + Add Student
          </Link>
          <Link
            href="/admin/fees/payments"
            className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            Record Payment
          </Link>
        </div>
      </div>

      {/* Fee Collection Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-100">Fee Collection This Month</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(stats.monthCollection)}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm text-green-100">Today&apos;s attendance: {stats.todayAttendance} records marked</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition group"
          >
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-dark group-hover:text-primary transition">
              {stats[card.key as keyof typeof stats]}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Charts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCharts />
        </div>
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-dark mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: '+ Add Student', href: '/admin/students/add', color: 'bg-primary' },
                { label: '+ Add Teacher', href: '/admin/teachers/add', color: 'bg-purple-500' },
                { label: 'Mark Attendance', href: '/admin/attendance', color: 'bg-teal-500' },
                { label: 'Record Payment', href: '/admin/fees/payments', color: 'bg-orange-500' },
                { label: 'Create Notice', href: '/admin/notices', color: 'bg-blue-500' },
                { label: 'View Applications', href: '/admin/admissions', color: 'bg-yellow-500' },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`block w-full px-4 py-2.5 ${action.color} text-white text-sm font-medium rounded-lg hover:opacity-90 transition text-center`}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {stats.newApplications > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {stats.newApplications} pending admission application{stats.newApplications !== 1 ? 's' : ''}
                  </p>
                  <Link href="/admin/admissions" className="text-xs text-yellow-600 hover:underline">
                    Review now →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {stats.pendingFees > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {stats.pendingFees} students with pending fees
                  </p>
                  <Link href="/admin/fees/records?status=pending" className="text-xs text-red-600 hover:underline">
                    View pending →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
