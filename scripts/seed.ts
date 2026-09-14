/**
 * Development Seed Script
 * Run: npx tsx scripts/seed.ts
 *
 * Creates sample data for development/demo purposes.
 * WARNING: Do NOT run against a production database.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: '.env.local' });

if (process.env.NODE_ENV === 'production') {
  console.error('❌ Seed script cannot run in production!');
  process.exit(1);
}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Models
import '../models/User';
import '../models/Branch';
import '../models/Division';
import '../models/Course';
import '../models/Class';
import '../models/Subject';
import '../models/AcademicYear';
import '../models/Teacher';
import '../models/Student';
import '../models/Parent';
import '../models/Enrollment';
import '../models/Notice';
import '../models/Testimonial';
import '../models/WebsiteSetting';
import '../models/FAQ';

const User = mongoose.model('User');
const Branch = mongoose.model('Branch');
const Division = mongoose.model('Division');
const Course = mongoose.model('Course');
const Class = mongoose.model('Class');
const Subject = mongoose.model('Subject');
const AcademicYear = mongoose.model('AcademicYear');
const Teacher = mongoose.model('Teacher');
const Student = mongoose.model('Student');
const Parent = mongoose.model('Parent');
const Enrollment = mongoose.model('Enrollment');
const Notice = mongoose.model('Notice');
const Testimonial = mongoose.model('Testimonial');
const WebsiteSetting = mongoose.model('WebsiteSetting');
const FAQ = mongoose.model('FAQ');

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected\n');

  // Clear existing dev data (collections only, not indexes)
  const collections = ['users', 'branches', 'divisions', 'courses', 'classes',
    'subjects', 'academicyears', 'teachers', 'students', 'parents', 'enrollments',
    'notices', 'testimonials', 'websitesettings', 'faqs'];
  for (const col of collections) {
    try {
      await mongoose.connection.collection(col).deleteMany({});
    } catch { /* collection may not exist yet */ }
  }
  console.log('🗑️  Cleared existing dev data\n');

  // ── Academic Year ─────────────────────────────────────────────────────────
  console.log('📅 Creating academic year...');
  const academicYear = await AcademicYear.create({
    name: '2026-27',
    startDate: new Date('2026-04-01'),
    endDate: new Date('2027-03-31'),
    isActive: true,
    isCurrent: true,
  });
  console.log(`   ✓ ${academicYear.name}`);

  // ── Divisions ─────────────────────────────────────────────────────────────
  console.log('\n📚 Creating divisions...');
  const nicDivision = await Division.create({
    name: { en: 'Nizami Islamic Center', hi: 'निज़ामी इस्लामिक सेंटर', ur: 'نظامی اسلامک سینٹر' },
    slug: 'nizami-islamic-center',
    code: 'NIC',
    description: {
      en: 'Providing authentic Islamic education including Quran, Hadith, Tajweed, and more.',
      hi: 'कुरान, हदीस, तजवीद आदि सहित प्रामाणिक इस्लामी शिक्षा प्रदान करना।',
      ur: 'قرآن، حدیث، تجوید وغیرہ سمیت مستند اسلامی تعلیم فراہم کرنا۔',
    },
    isActive: true,
    displayOrder: 1,
  });

  const eduDivision = await Division.create({
    name: { en: 'Nizami Education', hi: 'निज़ामी एजुकेशन', ur: 'نظامی ایجوکیشن' },
    slug: 'nizami-education',
    code: 'NE',
    description: {
      en: 'Quality academic coaching for Classes 1–8 in English, Mathematics, Science, and Computer.',
      hi: 'कक्षा 1-8 के लिए अंग्रेजी, गणित, विज्ञान और कंप्यूटर में गुणवत्तापूर्ण अकादमिक कोचिंग।',
      ur: 'کلاس 1-8 کے لیے انگریزی، ریاضی، سائنس اور کمپیوٹر میں معیاری تعلیم۔',
    },
    isActive: true,
    displayOrder: 2,
  });
  console.log(`   ✓ ${nicDivision.name.en}`);
  console.log(`   ✓ ${eduDivision.name.en}`);

  // ── Branches ──────────────────────────────────────────────────────────────
  console.log('\n🏢 Creating branches...');
  const branch1 = await Branch.create({
    name: 'Kokan Nagar Branch (Near Quba Masjid)',
    slug: 'baneli-quba-masjid',
    address: 'Habeeb Ansari Chawl, Near Quba Masjid, Kokan Nagar, Baneli Gaon',
    area: 'Kokan Nagar',
    city: 'Titwala (East)',
    state: 'Maharashtra',
    pincode: '421605',
    phone: '8779282185',
    whatsapp: '8779282185',
    email: 'info@nizami.in',
    description: {
      en: 'Habeeb Ansari Chawl, Near Quba Masjid, Kokan Nagar, Baneli Gaon, Titwala (East). Timings: Subah, Dopahar, Sham.',
    },
    openingHours: [
      { day: 'Monday - Saturday', open: '07:00', close: '21:00', isClosed: false },
      { day: 'Sunday', open: '08:00', close: '13:00', isClosed: false },
    ],
    facilities: ['Nazra Quran with Tajvid', 'Hifz Hadees with Tarjama', 'Deeni Masail', 'Hifz Surah', 'Urdu Likhna Padhna'],
    isActive: true,
    displayOrder: 1,
  });

  const branch2 = await Branch.create({
    name: 'Chota Chowk Branch (Khan Chawl)',
    slug: 'baneli-chota-chowk',
    address: 'Khan Chawl, Near Gupta Chawl, Chota Chowk, Baneli',
    area: 'Chota Chowk',
    city: 'Titwala (East)',
    state: 'Maharashtra',
    pincode: '421605',
    phone: '8779282185',
    whatsapp: '8779282185',
    description: {
      en: 'Khan Chawl, Near Gupta Chawl, Chota Chowk, Baneli, Titwala (East). Timings: Subah, Dopahar, Sham.',
    },
    openingHours: [
      { day: 'Monday - Saturday', open: '07:00', close: '21:00', isClosed: false },
      { day: 'Sunday', open: '08:00', close: '13:00', isClosed: false },
    ],
    facilities: ['Nazra Quran with Tajvid', 'Kalma with Tarjama', 'Masnoon Dua', 'Urdu Likhna Padhna'],
    isActive: true,
    displayOrder: 2,
  });

  const branch3 = await Branch.create({
    name: 'NRC Colony Branch (Ambivli Road)',
    slug: 'baneli-nrc-colony',
    address: 'Rehbar Chawl, Hussain Nagar, NRC Colony, Ambivli Road, Baneli',
    area: 'Hussain Nagar, NRC Colony',
    city: 'Titwala (East)',
    state: 'Maharashtra',
    pincode: '421605',
    phone: '8779282185',
    whatsapp: '8779282185',
    description: {
      en: 'Rehbar Chawl, Hussain Nagar, NRC Colony, Ambivli Road, Baneli, Titwala (East). Timings: Subah, Dopahar, Sham.',
    },
    openingHours: [
      { day: 'Monday - Saturday', open: '07:00', close: '21:00', isClosed: false },
      { day: 'Sunday', open: '08:00', close: '13:00', isClosed: false },
    ],
    facilities: ['Nazra Quran with Tajvid', 'Hamd, Naat, Manqabat & Taqreer', 'Deeni Masail', 'Urdu Likhna Padhna'],
    isActive: true,
    displayOrder: 3,
  });
  console.log(`   ✓ ${branch1.name}`);
  console.log(`   ✓ ${branch2.name}`);
  console.log(`   ✓ ${branch3.name}`);

  // ── Classes ───────────────────────────────────────────────────────────────
  console.log('\n🎓 Creating classes...');
  const classRecords = [];
  for (let i = 1; i <= 8; i++) {
    const cls = await Class.create({
      name: { en: `Class ${i}`, hi: `कक्षा ${i}`, ur: `کلاس ${i}` },
      slug: `class-${i}`,
      numericValue: i,
      divisionId: eduDivision._id,
      status: 'active',
      displayOrder: i,
    });
    classRecords.push(cls);
    process.stdout.write(`   ✓ Class ${i}${i < 8 ? ',' : '\n'} `);
  }

  // ── Subjects ──────────────────────────────────────────────────────────────
  console.log('\n📖 Creating subjects...');
  const subjectData = [
    { name: 'English', code: 'ENG' },
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Science', code: 'SCI' },
    { name: 'Basic Computer', code: 'COMP' },
  ];
  const subjectRecords = [];
  for (const s of subjectData) {
    const subj = await Subject.create({
      name: { en: s.name },
      code: s.code,
      divisionId: eduDivision._id,
      classIds: classRecords.map((c) => c._id),
      status: 'active',
    });
    subjectRecords.push(subj);
    console.log(`   ✓ ${s.name}`);
  }

  // ── Islamic Courses ───────────────────────────────────────────────────────
  console.log('\n🕌 Creating Islamic courses...');
  const islamicCourses = [
    { name: 'Nazra Quran with Tajweed', slug: 'nazra-quran-tajweed', fee: 500 },
    { name: 'Hifz Surah', slug: 'hifz-surah', fee: 600 },
    { name: 'Hifz Hadith with Tarjuma', slug: 'hifz-hadith-tarjuma', fee: 600 },
    { name: 'Deeni Masail', slug: 'deeni-masail', fee: 400 },
    { name: 'Masnoon Dua', slug: 'masnoon-dua', fee: 400 },
    { name: 'Kalma with Tarjama', slug: 'kalma-tarjama', fee: 350 },
    { name: 'Urdu Likhna Padhna', slug: 'urdu-likhna-padhna', fee: 450 },
    { name: 'Hamde Bari Taala & Naat', slug: 'hamd-naat', fee: 350 },
    { name: 'Taqreer (Islamic Speech)', slug: 'taqreer', fee: 300 },
    { name: 'Manqabat', slug: 'manqabat', fee: 300 },
  ];
  for (let i = 0; i < islamicCourses.length; i++) {
    const c = islamicCourses[i];
    await Course.create({
      name: { en: c.name },
      slug: c.slug,
      divisionId: nicDivision._id,
      fee: c.fee,
      status: 'active',
      featured: i < 6,
      branchIds: [branch1._id, branch2._id],
      displayOrder: i + 1,
    });
    console.log(`   ✓ ${c.name}`);
  }

  // ── Users & Teachers ──────────────────────────────────────────────────────
  console.log('\n👨‍🏫 Creating users and teachers...');

  // Super Admin
  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345!';
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@nizami.dev';

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  await User.create({
    username: adminUsername,
    email: adminEmail,
    passwordHash: adminPasswordHash,
    role: 'super_admin',
    isActive: true,
    mustChangePassword: false,
  });
  console.log(`   ✓ Super Admin: ${adminUsername} / ${adminPassword}`);

  // Teachers
  const teacherData = [
    { name: 'Maulana Abdul Qadir', phone: '+919800000001', subjects: 'Quran & Tajweed' },
    { name: 'Hafiz Mohammed Salim', phone: '+919800000002', subjects: 'Hifz & Hadith' },
    { name: 'Ustaz Ibrahim Khan', phone: '+919800000003', subjects: 'Deeni Masail & Urdu' },
    { name: 'Samira Sheikh', phone: '+919800000004', subjects: 'English & Science' },
    { name: 'Rizwan Ahmed', phone: '+919800000005', subjects: 'Mathematics & Computer' },
  ];

  for (let i = 0; i < teacherData.length; i++) {
    const t = teacherData[i];
    const username = `teacher${i + 1}`;
    const password = 'Teacher@123';
    const hash = await bcrypt.hash(password, 12);

    const tUser = await User.create({
      username,
      passwordHash: hash,
      role: 'teacher',
      isActive: true,
      mustChangePassword: false,
    });

    await Teacher.create({
      userId: tUser._id,
      name: t.name,
      phone: t.phone,
      branchIds: [branch1._id, branch2._id],
      subjectIds: i >= 3 ? subjectRecords.map((s) => s._id) : [],
      status: 'active',
      isPublic: true,
      bio: `Experienced educator specializing in ${t.subjects}.`,
      qualification: i < 3 ? 'Alim & Hafiz' : "B.Ed, M.Sc",
    });
    console.log(`   ✓ Teacher: ${t.name} (login: ${username} / ${password})`);
  }

  // ── Students ──────────────────────────────────────────────────────────────
  console.log('\n🧑‍🎓 Creating sample students...');
  const studentData = [
    { first: 'Ahmed', last: 'Khan', guardian: 'Mohammed Khan', phone: '+919700000001' },
    { first: 'Armaan', last: 'Sheikh', guardian: 'Rashid Sheikh', phone: '+919700000002' },
    { first: 'Aisha', last: 'Qureshi', guardian: 'Bilal Qureshi', phone: '+919700000003' },
    { first: 'Fatima', last: 'Ansari', guardian: 'Yusuf Ansari', phone: '+919700000004' },
    { first: 'Sameer', last: 'Patel', guardian: 'Imran Patel', phone: '+919700000005' },
  ];

  for (let i = 0; i < studentData.length; i++) {
    const s = studentData[i];
    const studentId = `NE-2026-${String(i + 1).padStart(4, '0')}`;
    const username = studentId.toLowerCase();
    const password = 'Student@123';
    const hash = await bcrypt.hash(password, 12);

    const sUser = await User.create({
      username,
      passwordHash: hash,
      role: 'student',
      isActive: true,
      mustChangePassword: true,
    });

    const student = await Student.create({
      userId: sUser._id,
      studentId,
      firstName: s.first,
      lastName: s.last,
      guardianName: s.guardian,
      guardianPhone: s.phone,
      primaryBranchId: branch1._id,
      academicYearId: academicYear._id,
      admissionDate: new Date(),
      status: 'active',
    });

    // Enroll in Nizami Education
    await Enrollment.create({
      studentId: student._id,
      divisionId: eduDivision._id,
      branchId: branch1._id,
      academicYearId: academicYear._id,
      classId: classRecords[i % 8]._id,
      subjectIds: subjectRecords.map((s) => s._id),
      enrollmentDate: new Date(),
      startDate: new Date(),
      status: 'active',
    });

    console.log(`   ✓ Student: ${s.first} ${s.last} (${studentId} / ${password})`);
  }

  // ── Notices ───────────────────────────────────────────────────────────────
  console.log('\n📋 Creating notices...');
  const adminUser = await User.findOne({ role: 'super_admin' });
  await Notice.create([
    {
      title: { en: 'Admissions Open for 2026-27 Academic Year' },
      content: { en: 'Admissions are now open for the 2026-27 academic year for both Nizami Islamic Center and Nizami Education. Limited seats available. Apply now!' },
      category: 'admission',
      publishDate: new Date(),
      status: 'published',
      priority: 'high',
      createdBy: adminUser._id,
    },
    {
      title: { en: 'Eid Holiday Notice' },
      content: { en: 'The center will remain closed on the occasion of Eid. Classes will resume from the next working day. Eid Mubarak to all students and families!' },
      category: 'holiday',
      publishDate: new Date(),
      status: 'published',
      priority: 'medium',
      createdBy: adminUser._id,
    },
    {
      title: { en: 'New Batch Starting: Hifz Hadith with Tarjuma' },
      content: { en: 'A new batch for Hifz Hadith with Tarjuma is starting. Interested students may contact the center office.' },
      category: 'batch',
      publishDate: new Date(),
      status: 'published',
      priority: 'medium',
      createdBy: adminUser._id,
    },
  ]);
  console.log('   ✓ 3 sample notices');

  // ── Testimonials ──────────────────────────────────────────────────────────
  console.log('\n⭐ Creating testimonials...');
  await Testimonial.create([
    {
      name: 'Mohammed Rafiq',
      role: 'Parent',
      message: { en: 'My children have benefited immensely from Nizami Islamic Center. The teachers are knowledgeable and dedicated. Highly recommended for Islamic education.' },
      rating: 5,
      status: 'approved',
      isPublished: true,
      displayOrder: 1,
    },
    {
      name: 'Sana Begum',
      role: 'Parent',
      message: { en: 'Nizami Education has improved my son\'s Mathematics and Science grades significantly. The small batch sizes ensure each child gets proper attention.' },
      rating: 5,
      status: 'approved',
      isPublished: true,
      displayOrder: 2,
    },
    {
      name: 'Asif Khan',
      role: 'Parent',
      message: { en: 'Excellent faculty and a wonderful learning environment. My daughter loves attending the Quran classes. JazakAllah Khair to all the teachers!' },
      rating: 5,
      status: 'approved',
      isPublished: true,
      displayOrder: 3,
    },
  ]);
  console.log('   ✓ 3 testimonials');

  // ── Website Settings ──────────────────────────────────────────────────────
  console.log('\n⚙️  Creating website settings...');
  const websiteSettingsData = [
    { key: 'centerName', value: 'Nizami Islamic Center', type: 'string', label: 'Center Name', group: 'general' },
    { key: 'phone', value: '8779282185', type: 'string', label: 'Phone Number', group: 'general' },
    { key: 'whatsapp', value: '8779282185', type: 'string', label: 'WhatsApp Number', group: 'general' },
    { key: 'email', value: 'info@nizami.in', type: 'string', label: 'Email Address', group: 'general' },
    { key: 'address', value: 'Baneli, Titwala (E), Dist. Thane, Maharashtra – 421605', type: 'string', label: 'Address', group: 'general' },
    { key: 'heroTitle', value: 'Education for Knowledge, Character & a Better Future', type: 'string', label: 'Hero Title', group: 'homepage' },
    { key: 'heroSubtitle', value: 'Nizami Islamic Center offers authentic Islamic education while Nizami Education provides quality academic coaching for Classes 1–8.', type: 'string', label: 'Hero Subtitle', group: 'homepage' },
    { key: 'statsStudents', value: '500+', type: 'string', label: 'Total Students (Display)', group: 'homepage' },
    { key: 'statsTeachers', value: '20+', type: 'string', label: 'Total Teachers (Display)', group: 'homepage' },
    { key: 'statsBranches', value: '3', type: 'string', label: 'Total Branches (Display)', group: 'homepage' },
    { key: 'statsCourses', value: '15+', type: 'string', label: 'Total Courses (Display)', group: 'homepage' },
    { key: 'instagram', value: '#', type: 'string', label: 'Instagram URL', group: 'social' },
    { key: 'facebook', value: '#', type: 'string', label: 'Facebook URL', group: 'social' },
    { key: 'youtube', value: '#', type: 'string', label: 'YouTube URL', group: 'social' },
    { key: 'admissionsOpen', value: 'true', type: 'boolean', label: 'Admissions Open', group: 'admissions' },
    { key: 'attendanceThreshold', value: '75', type: 'number', label: 'Attendance Alert Threshold (%)', group: 'system' },
    { key: 'student_id_counter_NE_2026', value: '5', type: 'number', label: '[System] NE Student ID Counter 2026', group: 'system' },
    { key: 'student_id_counter_NIC_2026', value: '0', type: 'number', label: '[System] NIC Student ID Counter 2026', group: 'system' },
    { key: 'receipt_counter_2026', value: '0', type: 'number', label: '[System] Receipt Counter 2026', group: 'system' },
  ];

  await WebsiteSetting.insertMany(websiteSettingsData);
  console.log(`   ✓ ${websiteSettingsData.length} website settings`);

  // ── FAQs ──────────────────────────────────────────────────────────────────
  console.log('\n❓ Creating FAQs...');
  await FAQ.create([
    { question: { en: 'What classes do you offer?' }, answer: { en: 'We offer Classes 1 to 8 under Nizami Education for academic subjects, and various Islamic courses under Nizami Islamic Center including Quran, Tajweed, Hifz, and more.' }, isPublished: true, displayOrder: 1 },
    { question: { en: 'What are the fee ranges?' }, answer: { en: 'Fees vary by course and class. Islamic courses start from ₹300/month and academic classes start from ₹500/month. Please contact your nearest branch for exact fee details.' }, isPublished: true, displayOrder: 2 },
    { question: { en: 'Where are your branches located?' }, answer: { en: 'We have branches in Titwala East (Main), Baneli, and Titwala West. Visit our Branches page for full addresses and contact details.' }, isPublished: true, displayOrder: 3 },
    { question: { en: 'How can I take admission?' }, answer: { en: 'You can apply online through our Admissions page, or visit any branch directly. Our staff will guide you through the enrollment process.' }, isPublished: true, displayOrder: 4 },
    { question: { en: 'Do you offer Quran classes for children?' }, answer: { en: 'Yes! We offer Nazra Quran with Tajweed for children of all ages. Classes are conducted by qualified Hafiz and Alim teachers.' }, isPublished: true, displayOrder: 5 },
    { question: { en: 'What are the class timings?' }, answer: { en: 'Morning batches start from 5:00 AM and evening batches continue till 10:00 PM. Specific timings depend on the course and branch. Contact your branch for exact schedule.' }, isPublished: true, displayOrder: 6 },
  ]);
  console.log('   ✓ 6 FAQs');

  console.log('\n' + '─'.repeat(60));
  console.log('✅ SEED COMPLETE!');
  console.log('─'.repeat(60));
  console.log('\n🔑 Login Credentials:');
  console.log(`   Super Admin: ${adminUsername} / ${adminPassword}`);
  console.log('   Teacher 1:  teacher1 / Teacher@123');
  console.log('   Student 1:  ne-2026-0001 / Student@123');
  console.log('\n🌐 Start the dev server: npm run dev');
  console.log('   Then visit: http://localhost:3000\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
