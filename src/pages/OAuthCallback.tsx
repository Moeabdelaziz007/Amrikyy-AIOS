import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const process = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const scope = searchParams.get('scope');

      if (error) {
        alert(`OAuth error: ${error}`);
        navigate('/settings');
        return;
      }
      if (!code) {
        navigate('/settings');
        return;
      }

      // Determine type: if scope includes 'calendar', it's calendar; else gmail
      const type = scope && scope.includes('calendar') ? 'calendar' : 'gmail';

      try {
        const { data } = await supabase.auth.getSession();
        const accessToken = data?.session?.access_token;

        const resp = await fetch(`/api/${type}/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
          },
          body: JSON.stringify({ code })
        });

        if (!resp.ok) {
          const txt = await resp.text();
          console.error('Callback exchange failed', txt);
          alert(`Failed to complete ${type} OAuth flow. Check console.`);
        } else {
          alert(`${type === 'calendar' ? 'Google Calendar' : 'Gmail'} connected successfully!`);
        }
      } catch (e) {
        console.error('OAuth callback error', e);
        alert('OAuth callback failed.');
      } finally {
        navigate('/settings');
      }
    };

    process();
  }, [searchParams, navigate]);

  return <div className="p-6">Processing OAuth...</div>;
}
