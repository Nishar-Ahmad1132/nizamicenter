import Link from 'next/link';
import { GraduationCap, Phone, MapPin, Mail, MessageCircle } from 'lucide-react';

interface FooterProps {
  settings: Record<string, string>;
}

export default function PublicFooter({ settings }: FooterProps) {
  const phone = settings.phone ?? '';
  const whatsapp = settings.whatsapp ?? '';
  const email = settings.email ?? '';
  const address = settings.address ?? 'Titwala, Maharashtra, India';
  const centerName = settings.centerName ?? 'Nizami Islamic Center';

  return (
    <footer className="bg-[#1A1A2E] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#1B6B3A] rounded-xl flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{centerName}</p>
                <p className="text-gray-400 text-xs">& Nizami Education</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Providing quality Islamic and academic education to nurture knowledge, character, and a better future.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Islamic Center', href: '/islamic-center' },
                { label: 'Nizami Education', href: '/education' },
                { label: 'Our Teachers', href: '/teachers' },
                { label: 'Admissions', href: '/admissions' },
                { label: 'Notice Board', href: '/notices' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Programs</h3>
            <ul className="space-y-2">
              {[
                { label: 'Nazra Quran with Tajweed', href: '/islamic-center/courses' },
                { label: 'Hifz Surah', href: '/islamic-center/courses' },
                { label: 'Deeni Masail', href: '/islamic-center/courses' },
                { label: 'Class 1–8 Tuition', href: '/education/classes' },
                { label: 'Mathematics', href: '/education/subjects' },
                { label: 'Science & Computer', href: '/education/subjects' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Contact Us</h3>
            <ul className="space-y-3">
              {address && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#1B6B3A] shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-400">{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#1B6B3A] shrink-0" />
                  <a href={`tel:${phone}`} className="text-sm text-gray-400 hover:text-white transition">{phone}</a>
                </li>
              )}
              {whatsapp && (
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#1B6B3A] shrink-0" />
                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    WhatsApp Us
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#1B6B3A] shrink-0" />
                  <a href={`mailto:${email}`} className="text-sm text-gray-400 hover:text-white transition">{email}</a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {centerName} & Nizami Education. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition">Privacy Policy</Link>
            <Link href="/contact" className="text-xs text-gray-500 hover:text-gray-300 transition">Contact</Link>
            <Link href="/login" className="text-xs text-gray-500 hover:text-gray-300 transition">Portal Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
