      const { data } = await supabase.auth.getSession();
      const accessToken = data?.session?.access_token;

      const [gmailRes, calendarRes] = await Promise.all([
        fetch('/api/gmail/status', { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} }),
        fetch('/api/calendar/status', { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} })
      ]);

      const gmailData = gmailRes.ok ? await gmailRes.json() : null;
      const calendarData = calendarRes.ok ? await calendarRes.json() : null;

      setIntegrations({
        gmail: gmailData?.connected ? gmailData : undefined,
        calendar: calendarData?.connected ? calendarData : undefined
      });
    } catch (err) {
      console.error('Failed to fetch integrations', err);
    } finally {
      setLoading(false);
    }
  };

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
interface Integration {
  service: string;
  access_token: string;
  // Add other fields if needed
}

export default function SettingsView() {
  const [integrations, setIntegrations] = useState<{ gmail?: Integration; calendar?: Integration }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
  const connectGoogle = async (type: 'calendar' | 'gmail') => {
  const disconnectGoogle = async (type: 'calendar' | 'gmail') => {
    if (!confirm(`Are you sure you want to disconnect ${type}?`)) return;

    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data?.session?.access_token;

      const res = await fetch(`/api/${type}/disconnect`, {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
      });

      if (res.ok) {
        setIntegrations(prev => ({ ...prev, [type]: undefined }));
        alert(`${type} disconnected successfully.`);
      } else {
        alert('Failed to disconnect.');
      }
    } catch (err: any) {
      console.error('disconnectGoogle error', err);
      alert('Failed to disconnect. Check console for details.');
    }
  };

  if (loading) return <div className="p-6">Loading integrations...</div>;

    try {
      // Get the current session (user) to include auth token
      const { data } = await supabase.auth.getSession();
      const accessToken = data?.session?.access_token;

      <div className="space-y-4">
        {/* Gmail Integration */}
        <div className="border border-white/10 rounded p-4">
          <h3 className="font-semibold">Gmail</h3>
          {integrations.gmail ? (
            <div className="mt-2">
              <p className="text-sm text-green-400">Connected as {integrations.gmail.email || 'unknown'}</p>
              <button className="btn bg-red-500/80 px-3 py-1 rounded mt-2" onClick={() => disconnectGoogle('gmail')}>Disconnect</button>
            </div>
          ) : (
            <button className="btn bg-primary-blue/80 px-4 py-2 rounded mt-2" onClick={() => connectGoogle('gmail')}>ربط Gmail</button>
          )}
        </div>

        {/* Calendar Integration */}
        <div className="border border-white/10 rounded p-4">
          <h3 className="font-semibold">Google Calendar</h3>
          {integrations.calendar ? (
            <div className="mt-2">
              <p className="text-sm text-green-400">Connected as {integrations.calendar.email || 'unknown'}</p>
              <button className="btn bg-red-500/80 px-3 py-1 rounded mt-2" onClick={() => disconnectGoogle('calendar')}>Disconnect</button>
            </div>
          ) : (
            <button className="btn bg-primary-cyan/80 px-4 py-2 rounded mt-2" onClick={() => connectGoogle('calendar')}>ربط Google Calendar</button>
          )}
        </div>
      });
      const payload = await res.json();
      const url = payload.authUrl || payload.url || payload;
      if (typeof url === 'string') window.location.href = url;
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

