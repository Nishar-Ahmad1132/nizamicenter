// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' });

import mongoose from 'mongoose';
import '../models/Division';
import '../models/Branch';
import '../models/Course';
import '../models/Class';
import '../models/Subject';
import '../models/Teacher';
import '../models/AcademicYear';
import '../models/Timetable';

const Division = mongoose.model('Division');
const Branch = mongoose.model('Branch');
const Course = mongoose.model('Course');
const ClassModel = mongoose.model('Class');
const Subject = mongoose.model('Subject');
const Teacher = mongoose.model('Teacher');
const AcademicYear = mongoose.model('AcademicYear');
const Timetable = mongoose.model('Timetable');

async function seedTimetable() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected');

  const [divisions, branches, teachers, academicYear, courses, classes, subjects] = await Promise.all([
    Division.find({ isActive: true }),
    Branch.find({ isActive: true }),
    Teacher.find({ status: 'active' }),
    AcademicYear.findOne({ isCurrent: true }) || AcademicYear.findOne({ isActive: true }),
    Course.find({ status: 'active' }),
    ClassModel.find({ isActive: true }),
    Subject.find({ status: 'active' }),
  ]);

  if (!academicYear) {
    console.error('❌ No academic year found.');
    process.exit(1);
  }

  const nicDivision = divisions.find((d) => d.code === 'NIC' || d.slug.includes('islamic')) || divisions[0];
  const eduDivision = divisions.find((d) => d.code === 'NE' || d.slug.includes('education')) || divisions[1] || divisions[0];

  const branch1 = branches[0];
  const branch2 = branches[1] || branches[0];

  const qariAbdulQadir = teachers.find((t) => t.name.includes('Abdul Qadir')) || teachers[0];
  const hafizSalim = teachers.find((t) => t.name.includes('Salim')) || teachers[1] || teachers[0];
  const ustazIbrahim = teachers.find((t) => t.name.includes('Ibrahim')) || teachers[2] || teachers[0];
  const samiraTeacher = teachers.find((t) => t.name.includes('Samira')) || teachers[3] || teachers[0];
  const rizwanTeacher = teachers.find((t) => t.name.includes('Rizwan')) || teachers[4] || teachers[0];

  // Islamic Courses
  const nazraCourse = courses.find((c) => c.slug.includes('nazra')) || courses[0];
  const hifzCourse = courses.find((c) => c.slug.includes('hifz-surah')) || courses[1] || courses[0];
  const hadithCourse = courses.find((c) => c.slug.includes('hadith')) || courses[2] || courses[0];
  const masailCourse = courses.find((c) => c.slug.includes('masail')) || courses[3] || courses[0];

  // Academic Classes & Subjects
  const class5 = classes.find((c) => c.numericValue === 5) || classes[0];
  const class8 = classes.find((c) => c.numericValue === 8) || classes[classes.length - 1] || classes[0];
  const mathSubj = subjects.find((s) => s.code === 'MATH') || subjects[0];
  const sciSubj = subjects.find((s) => s.code === 'SCI') || subjects[1] || subjects[0];
  const engSubj = subjects.find((s) => s.code === 'ENG') || subjects[2] || subjects[0];

  // Clear existing timetable slots
  await Timetable.deleteMany({});
  console.log('🗑️  Cleared old timetable slots');

  const slotsToCreate = [
    // --- MONDAY ---
    {
      branchId: branch1._id,
      divisionId: nicDivision._id,
      courseId: nazraCourse?._id,
      teacherId: qariAbdulQadir._id,
      day: 'monday',
      startTime: '07:30 AM',
      endTime: '09:30 AM',
      room: 'Hall 1',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },
    {
      branchId: branch1._id,
      divisionId: nicDivision._id,
      courseId: hadithCourse?._id,
      teacherId: hafizSalim._id,
      day: 'monday',
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      room: 'Room 204',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },
    {
      branchId: branch1._id,
      divisionId: eduDivision._id,
      classId: class5?._id,
      subjectId: mathSubj?._id,
      teacherId: rizwanTeacher._id,
      day: 'monday',
      startTime: '04:30 PM',
      endTime: '05:45 PM',
      room: 'Room 102',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },
    {
      branchId: branch1._id,
      divisionId: eduDivision._id,
      classId: class8?._id,
      subjectId: sciSubj?._id,
      teacherId: samiraTeacher._id,
      day: 'monday',
      startTime: '06:00 PM',
      endTime: '07:15 PM',
      room: 'Science Lab',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },

    // --- TUESDAY ---
    {
      branchId: branch1._id,
      divisionId: nicDivision._id,
      courseId: hifzCourse?._id,
      teacherId: qariAbdulQadir._id,
      day: 'tuesday',
      startTime: '07:30 AM',
      endTime: '09:30 AM',
      room: 'Hall 1',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },
    {
      branchId: branch1._id,
      divisionId: nicDivision._id,
      courseId: masailCourse?._id,
      teacherId: ustazIbrahim._id,
      day: 'tuesday',
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      room: 'Room 204',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },
    {
      branchId: branch1._id,
      divisionId: eduDivision._id,
      classId: class8?._id,
      subjectId: mathSubj?._id,
      teacherId: rizwanTeacher._id,
      day: 'tuesday',
      startTime: '04:30 PM',
      endTime: '05:45 PM',
      room: 'Room 102',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },
    {
      branchId: branch1._id,
      divisionId: eduDivision._id,
      classId: class5?._id,
      subjectId: engSubj?._id,
      teacherId: samiraTeacher._id,
      day: 'tuesday',
      startTime: '06:00 PM',
      endTime: '07:15 PM',
      room: 'Room 101',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },

    // --- WEDNESDAY ---
    {
      branchId: branch1._id,
      divisionId: nicDivision._id,
      courseId: nazraCourse?._id,
      teacherId: qariAbdulQadir._id,
      day: 'wednesday',
      startTime: '07:30 AM',
      endTime: '09:30 AM',
      room: 'Hall 1',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },
    {
      branchId: branch1._id,
      divisionId: eduDivision._id,
      classId: class5?._id,
      subjectId: sciSubj?._id,
      teacherId: samiraTeacher._id,
      day: 'wednesday',
      startTime: '04:30 PM',
      endTime: '05:45 PM',
      room: 'Science Lab',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },

    // --- THURSDAY ---
    {
      branchId: branch1._id,
      divisionId: nicDivision._id,
      courseId: hadithCourse?._id,
      teacherId: hafizSalim._id,
      day: 'thursday',
      startTime: '07:30 AM',
      endTime: '09:30 AM',
      room: 'Hall 1',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },
    {
      branchId: branch1._id,
      divisionId: eduDivision._id,
      classId: class8?._id,
      subjectId: engSubj?._id,
      teacherId: samiraTeacher._id,
      day: 'thursday',
      startTime: '04:30 PM',
      endTime: '05:45 PM',
      room: 'Room 101',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },

    // --- FRIDAY ---
    {
      branchId: branch1._id,
      divisionId: nicDivision._id,
      courseId: nazraCourse?._id,
      teacherId: qariAbdulQadir._id,
      day: 'friday',
      startTime: '07:30 AM',
      endTime: '10:00 AM',
      room: 'Main Mosque',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },

    // --- SATURDAY ---
    {
      branchId: branch1._id,
      divisionId: nicDivision._id,
      courseId: hifzCourse?._id,
      teacherId: hafizSalim._id,
      day: 'saturday',
      startTime: '08:00 AM',
      endTime: '11:00 AM',
      room: 'Hall 1',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },
    {
      branchId: branch1._id,
      divisionId: eduDivision._id,
      classId: class8?._id,
      subjectId: mathSubj?._id,
      teacherId: rizwanTeacher._id,
      day: 'saturday',
      startTime: '02:00 PM',
      endTime: '05:00 PM',
      room: 'Room 102',
      status: 'active',
      academicYearId: academicYear._id,
      isActive: true,
    },
  ];

  for (const slot of slotsToCreate) {
    await Timetable.create(slot);
  }

  console.log(`✅ Successfully seeded ${slotsToCreate.length} timetable sessions across Islamic Center and Education Center!`);
  process.exit(0);
}

seedTimetable().catch((err) => {
  console.error('❌ Error seeding timetable:', err);
  process.exit(1);
});
