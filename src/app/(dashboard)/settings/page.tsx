// app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  User,
  Mail,
  Calendar,
  Settings as SettingsIcon,
  LogOut,
  CheckCircle,
  Gem
} from "lucide-react";
import { PremiumModal } from "@/components/ai/PremiumModal";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  // Profile fields states mapping exact database schema
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [createdDate, setCreatedDate] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  // Status tracking properties flags
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reusable modal state visibility popup parameter
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  useEffect(() => {
    async function getProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        setEmail(user.email ?? null);
        setCreatedDate(
          user.created_at
            ? new Date(user.created_at).toLocaleDateString()
            : null
        );

        // Fetch user metadata matching specific public.profiles column naming rules
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url, premium")
          .eq("id", user.id)
          .single();

        if (profile) {
          setDisplayName(profile.display_name || "");
          setAvatarUrl(profile.avatar_url || "");
          setIsPremium(!!profile.premium);
        }
      }
    }
    getProfile();
  }, [supabase]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !email) return;

    setSavingProfile(true);
    setProfileSuccess(false);
    setError(null);

    try {
      // Using .upsert() guarantees updates save safely even if a profile row doesn't exist yet
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ 
          id: userId,
          email: email, // email is marked as NOT NULL in your schema
          display_name: displayName,
          avatar_url: avatarUrl,
          premium: isPremium // retains current premium setting state safely
        }, { onConflict: 'id' });

      if (updateError) throw updateError;
      
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to commit profile updates.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-8 max-w-screen min-h-screen pb-12 text-white">
      
      {/* Header Info Block summary */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Profile Identity Customization</span>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold mt-1">
            Account Settings
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Modify identity components visibility indices and check subscription states.
          </p>
        </div>
      </div>

      {/* Subscription Quick View Promotional Card Element */}
      <div className="p-6 w-full rounded-2xl border border-amber-500/20 bg-amber-950/20 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-amber-500">
          <div className="flex items-start gap-3">
            <Gem className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">
                {isPremium ? "Premium Subscription Active" : "Unlock Financial Intelligence Engine Layers"}
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">
                {isPremium 
                  ? "Enjoy contextual structural NLP commands conversions on all active assistant pipelines."
                  : "Access premium automated tracking modules powered directly by deep processing token models."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPremiumModalOpen(true)}
            className="px-6 py-2 border border-amber-500/30 rounded-xl text-white bg-gradient-to-r font-semibold from-amber-400 via-amber-500 to-amber-400 cursor-pointer hover:scale-102 transition-all text-xs text-center self-start sm:self-auto"
          >
            {isPremium ? "Manage Subscription Plan" : "Upgrade Plan"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Identity Card block column 1 */}
        <div className="glass-panel p-6 w-full space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-indigo-400" />
            <span>Identity Presentation</span>
          </h4>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {profileSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Profile metrics saved correctly!</span>
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
                className="w-full glass-input bg-slate-950/40 border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
                Avatar Image Resource Link URL
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full glass-input bg-slate-950/40 border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white"
              />
            </div>

            <button type="submit" disabled={savingProfile} className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition font-semibold text-xs rounded-xl tracking-wider uppercase disabled:opacity-50 cursor-pointer">
              {savingProfile ? "Syncing Fields Data..." : "Update Identity Setup"}
            </button>
          </form>
        </div>

        {/* Credentials Static Matrix info card column 2 */}
        <div className="glass-panel p-6 w-full space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <SettingsIcon className="h-4.5 w-4.5 text-pink-400" />
              <span>Verification Parameters Context</span>
            </h4>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">Account Mail Address</p>
                  <p className="text-xs font-medium text-slate-200 mt-1 leading-none">{email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                <Calendar className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">Member Registration Timestamp</p>
                  <p className="text-xs font-medium text-slate-200 mt-1 leading-none">{createdDate}</p>
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleSignOut} className="w-full py-2.5 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 transition text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer">
            <LogOut className="h-4 w-4" />
            <span>Terminate Authentication Session</span>
          </button>
        </div>
      </div>

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        userId={userId}
        isPremiumInitial={isPremium}
        onTierUpdated={(nextState) => setIsPremium(nextState)}
      />

    </div>
  );
}