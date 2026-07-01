'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Sparkles, 
  User, 
  Mail, 
  Calendar, 
  Settings as SettingsIcon,
  LogOut,
  CheckCircle,
  Bell,
  Globe
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  // User details state
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [createdDate, setCreatedDate] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preference mock states
  const [currency, setCurrency] = useState('USD');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setEmail(user.email ?? null);
        setCreatedDate(user.created_at ? new Date(user.created_at).toLocaleDateString() : null);

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();

        if (profile?.display_name) {
          setDisplayName(profile.display_name);
        } else {
          setDisplayName(user.email ? user.email.split('@')[0] : '');
        }
      }
    }
    getProfile();
  }, [supabase]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSavingProfile(true);
    setProfileSuccess(false);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', userId);

      if (updateError) throw updateError;
      setProfileSuccess(true);
      
      // Clear success indicator after 3 seconds
      setTimeout(() => setProfileSuccess(false), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile display name.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header Banner */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Profile and Customization</span>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-white mt-1">
            Account Settings
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Modify your credentials, configure alerts, and adjust dashboard defaults.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Profile Editing */}
        <div className="glass-panel p-6 w-full space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-indigo-400" />
            <span>Profile Information</span>
          </h4>
          <p className="text-[11px] text-slate-400">Configure how you appear on the dashboard</p>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {profileSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full glass-input"
                placeholder="John Doe"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full glass-button-primary"
            >
              {savingProfile ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </form>
        </div>

        {/* Card 2: Account Details & Security */}
        <div className="glass-panel p-6 w-full space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <SettingsIcon className="h-4.5 w-4.5 text-pink-400" />
              <span>Account Credentials</span>
            </h4>
            <p className="text-[11px] text-slate-400">Read-only verification credentials</p>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">Email address</p>
                  <p className="text-xs text-white font-medium mt-1 leading-none">{email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                <Calendar className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">Member Since</p>
                  <p className="text-xs text-white font-medium mt-1 leading-none">{createdDate}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full glass-button-danger border border-red-500/20 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Terminate Current Session</span>
          </button>
        </div>
      </div>

      {/* Card 3: Dashboard Preferences */}
      <div className="glass-panel p-6 w-full space-y-5">
        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Globe className="h-4.5 w-4.5 text-indigo-400" />
          <span>Dashboard Preferences</span>
        </h4>
        <p className="text-[11px] text-slate-400">Tweak defaults and alert patterns</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-white">Default Currency</p>
              <p className="text-[10px] text-slate-400 font-medium">Standard formatting index</p>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="glass-input appearance-none py-1.5 px-3 bg-slate-900 font-semibold text-xs text-slate-200"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/[0.03]">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-white">Budget Alerts</p>
              <p className="text-[10px] text-slate-400 font-medium">Notify when exceeding 75% limit</p>
            </div>
            
            <button
              onClick={() => setNotifications(!notifications)}
              className={`h-6 w-11 rounded-full p-1 cursor-pointer transition-all duration-200 ${
                notifications ? 'bg-indigo-600' : 'bg-white/10'
              }`}
            >
              <div 
                className={`h-4 w-4 rounded-full bg-white transition-all duration-200 ${
                  notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
