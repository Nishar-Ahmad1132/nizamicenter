'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, GraduationCap, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  settings: Record<string, string>;
}

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  {
    label: 'Islamic Center',
    href: '/islamic-center',
    children: [
      { label: 'Overview', href: '/islamic-center' },
      { label: 'Courses', href: '/islamic-center/courses' },
    ],
  },
  {
    label: 'Nizami Education',
    href: '/education',
    children: [
      { label: 'Overview', href: '/education' },
      { label: 'Classes', href: '/education/classes' },
      { label: 'Subjects', href: '/education/subjects' },
    ],
  },
  { label: 'Teachers', href: '/teachers' },
  { label: 'Branches', href: '/branches' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'Notices', href: '/notices' },
  { label: 'Contact', href: '/contact' },
];

export default function PublicNavbar({ settings }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const centerName = settings.centerName ?? 'Nizami Islamic Center';
  const whatsapp = settings.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1B6B3A] rounded-xl flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-[#1A1A2E] leading-none">{centerName}</p>
              <p className="text-xs text-gray-500 leading-none mt-0.5">& Nizami Education</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.children && setDropdown(link.href)}
                onMouseLeave={() => setDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                      ? 'text-[#1B6B3A] bg-[#E8F5EE]'
                      : 'text-gray-700 hover:text-[#1B6B3A] hover:bg-[#E8F5EE]'
                  )}
                >
                  {link.label}
                  {link.children && <ChevronDown className="w-3 h-3" />}
                </Link>

                {link.children && dropdown === link.href && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#E8F5EE] hover:text-[#1B6B3A]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA + Login */}
          <div className="hidden lg:flex items-center gap-2">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-medium text-[#1B6B3A] border border-[#1B6B3A] rounded-lg hover:bg-[#E8F5EE] transition"
              >
                WhatsApp
              </a>
            )}
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium bg-[#1B6B3A] text-white rounded-lg hover:bg-[#0D4A28] transition"
            >
              Login
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <div key={link.href}>
              <Link
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-3 py-2.5 text-sm font-medium rounded-lg',
                  pathname === link.href
                    ? 'text-[#1B6B3A] bg-[#E8F5EE]'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
              {link.children && (
                <div className="ml-4 mt-1 space-y-1">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-xs text-gray-600 hover:text-[#1B6B3A] rounded-lg hover:bg-gray-50"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-2 flex gap-2">
            <Link
              href="/admissions/apply"
              className="flex-1 text-center py-2.5 text-sm font-medium bg-[#1B6B3A] text-white rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Apply Now
            </Link>
            <Link
              href="/login"
              className="flex-1 text-center py-2.5 text-sm font-medium border border-[#1B6B3A] text-[#1B6B3A] rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
