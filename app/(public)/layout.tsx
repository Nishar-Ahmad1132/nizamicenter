import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import dbConnect from '@/lib/db/mongoose';
import WebsiteSetting from '@/models/WebsiteSetting';

async function getPublicSettings() {
  try {
    await dbConnect();
    const settings = await WebsiteSetting.find({ group: 'general' }).lean();
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return map;
  } catch {
    return {};
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSettings();
  return (
    <>
      <PublicNavbar settings={settings} />
      <main>{children}</main>
      <PublicFooter settings={settings} />
    </>
  );
}
