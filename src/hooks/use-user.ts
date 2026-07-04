'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useUser() {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getUserDetails() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email?.split('@')[0] || 
                       'User';
          setUserName(name);
        }
      } catch (err) {
        console.error('Failed to grab user session details:', err);
      } finally {
        setLoading(false);
      }
    }

    getUserDetails();
  }, [supabase]);

  return { userName, loading };
}