'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

// Placeholder data — real data will come from API routes
const monthlyAdmissions = [
  { month: 'Apr', students: 12 },
  { month: 'May', students: 18 },
  { month: 'Jun', students: 25 },
  { month: 'Jul', students: 15 },
  { month: 'Aug', students: 30 },
  { month: 'Sep', students: 22 },
];

const feeCollection = [
  { month: 'Apr', amount: 45000 },
  { month: 'May', amount: 52000 },
  { month: 'Jun', amount: 48000 },
  { month: 'Jul', amount: 61000 },
  { month: 'Aug', amount: 55000 },
  { month: 'Sep', amount: 38000 },
];

const divisionData = [
  { name: 'Islamic Center', value: 45 },
  { name: 'Nizami Education', value: 55 },
];

const COLORS = ['#1B6B3A', '#C0392B'];

export default function DashboardCharts() {
  return (
    <div className="space-y-4">
      {/* Admissions Trend */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-dark mb-4">Monthly Admissions</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyAdmissions}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="students" fill="#1B6B3A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Fee Collection */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-dark mb-4">Fee Collection Trend (₹)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={feeCollection}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Collected']} />
            <Line type="monotone" dataKey="amount" stroke="#D4A017" strokeWidth={2} dot={{ fill: '#D4A017' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Division Split */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-dark mb-4">Students by Division</h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={divisionData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
              {divisionData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
