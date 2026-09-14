'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Save } from 'lucide-react';

interface Setting {
  _id: string;
  key: string;
  value: string;
  group?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [edits, setEdits] = useState<Record<string, string>>({});

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data.settings ?? []);
      const initial: Record<string, string> = {};
      for (const s of (data.settings ?? [])) initial[s.key] = s.value;
      setEdits(initial);
    } catch {
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  async function saveSettings() {
    setSaving(true);
    setMessage('');
    try {
      const updates = Object.entries(edits).map(([key, value]) => ({ key, value }));
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) throw new Error('Save failed');
      setMessage('✅ Settings saved successfully');
    } catch {
      setMessage('❌ Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  // Group settings
  const grouped: Record<string, Setting[]> = {};
  for (const s of settings) {
    const group = s.group ?? 'general';
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(s);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark flex items-center gap-2"><Settings className="w-6 h-6" /> Website Settings</h1>
        <button onClick={saveSettings} disabled={saving}
          className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition flex items-center gap-2 disabled:opacity-50">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {message && (
        <div className={`text-sm px-4 py-3 rounded-lg ${message.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-dark mb-4 capitalize">{group.replace(/_/g, ' ')}</h3>
          <div className="space-y-3">
            {items.map(s => (
              <div key={s._id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-600 sm:w-48 shrink-0">
                  {s.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <input
                  type="text"
                  value={edits[s.key] ?? ''}
                  onChange={e => setEdits(prev => ({ ...prev, [s.key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
