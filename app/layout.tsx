import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Noto_Nastaliq_Urdu } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  variable: '--font-noto-nastaliq',
  display: 'swap',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Nizami Islamic Center & Nizami Education',
    template: '%s | Nizami Islamic Center',
  },
  description:
    'Nizami Islamic Center provides quality Islamic education including Quran, Tajweed, Hifz, and Deeni education. Nizami Education offers academic coaching for Classes 1–8.',
  keywords: [
    'Nizami Islamic Center',
    'Quran classes Titwala',
    'Islamic education',
    'Hifz classes',
    'Tajweed classes',
    'Tuition classes Titwala',
    'Coaching classes Titwala',
    'Nizami Education',
    'Class 1 to 8 tuition',
  ],
  authors: [{ name: 'Nizami Islamic Center' }],
  creator: 'Nizami Islamic Center',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Nizami Islamic Center & Nizami Education',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoNastaliqUrdu.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
