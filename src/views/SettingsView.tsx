import React from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SettingsView() {
  const connectGoogle = async (type: 'calendar' | 'gmail') => {
    try {
      // Get the current session (user) to include auth token
      const { data } = await supabase.auth.getSession();
      const accessToken = data?.session?.access_token;

      const res = await fetch(`/api/${type}/auth-url`, {
        method: 'GET',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
      });
      const payload = await res.json();
      const url = payload.authUrl || payload.url || payload;
      if (typeof url === 'string') window.location.href = url;
      else alert('Failed to get auth url');
    } catch (err: any) {
      console.error('connectGoogle error', err);
      alert('Failed to start Google OAuth flow. Check console for details.');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">إعدادات التكامل</h1>
      <p className="text-sm text-text-secondary">قم بربط حساب Google الخاص بك لمزامنة التقويم وإرسال البريد الإلكتروني.</p>

      <div className="flex gap-3 mt-4">
        <button className="btn bg-primary-cyan/80 px-4 py-2 rounded" onClick={() => connectGoogle('calendar')}>ربط Google Calendar</button>
        <button className="btn bg-primary-blue/80 px-4 py-2 rounded" onClick={() => connectGoogle('gmail')}>ربط Gmail</button>
      </div>
    </div>
  );
}

