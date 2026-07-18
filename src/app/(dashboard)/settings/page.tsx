// app/settings/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
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
  Gem,
  Info,
  Package,
  Zap,
} from "lucide-react";
import { PremiumModal } from "@/components/ai/PremiumModal";
import Cropper from "react-easy-crop";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [createdDate, setCreatedDate] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any,
  ): Promise<Blob> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));
    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );
    return new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg"),
    );
  };

  // Inside SettingsPage component
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = (croppedArea: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  };

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
            : null,
        );

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
    setError(null);

    try {
      let finalAvatarUrl = avatarUrl;

      if (previewUrl && croppedAreaPixels) {
        const blob = await getCroppedImg(previewUrl, croppedAreaPixels);
        const file = new File([blob], `${userId}.jpg`, { type: "image/jpeg" });
        const filePath = `avatars/${userId}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        finalAvatarUrl = data.publicUrl;
      }

      const { error: updateError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email,
          display_name: displayName,
          avatar_url: finalAvatarUrl,
          premium: isPremium,
        },
        { onConflict: "id" },
      );

      if (updateError) throw updateError;

      setAvatarUrl(finalAvatarUrl);
      setPreviewUrl(null);
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
            Modify identity components visibility indices and check subscription
            states.
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
                {isPremium
                  ? "Premium Subscription Active"
                  : "Unlock Financial Intelligence Engine Layers"}
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

            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                Profile Avatar
              </label>
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    className="h-16 w-16 rounded-full object-cover border border-white/10"
                    alt={displayName}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 border border-white/10 flex items-center justify-center font-black text-xl text-white uppercase">
                    {displayName ? displayName.slice(0, 2).toUpperCase() : "??"}
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="glass-button-secondary px-4 py-2 text-xs"
                >
                  Change Photo
                </button>
              </div>
              {previewUrl && (
                <div className="fixed inset-0 z-50 bg-black/80 p-10 flex flex-col items-center">
                  <div className="relative h-64 w-64 md:h-96 md:w-96">
                    <Cropper
                      image={previewUrl}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  <div className="mt-8 flex gap-4">
                    <button
                      onClick={() => setPreviewUrl(null)}
                      className="px-4 py-2 text-xs text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setPreviewUrl(previewUrl)}
                      className="glass-button-primary px-6 py-2 text-xs"
                    >
                      Confirm Crop Selection
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition font-semibold text-xs rounded-xl tracking-wider uppercase disabled:opacity-50 cursor-pointer"
            >
              {savingProfile
                ? "Syncing Fields Data..."
                : "Update Identity Setup"}
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
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                    Account Mail Address
                  </p>
                  <p className="text-xs font-medium text-slate-200 mt-1 leading-none">
                    {email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                <Calendar className="h-5 w-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                    Member Registration Timestamp
                  </p>
                  <p className="text-xs font-medium text-slate-200 mt-1 leading-none">
                    {createdDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-2.5 rounded-xl border border-red-500/20 hover:bg-red-500/30 bg-red-500/10 text-red-400 transition text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Terminate Authentication Session</span>
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 w-full space-y-4">
        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Info className="h-4.5 w-4.5 text-blue-400" />
          <span>Application Details</span>
        </h4>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Package className="h-4 w-4" /> Current Version
            </span>
            <span className="text-white font-mono">v1.2.4</span>
          </div>

          <div className="pt-3 border-t border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Upcoming Updates
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-yellow-500" /> Advanced AI
                analytics dashboard
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-yellow-500" />
                Weaponize Mutual Accountability
              </li>
            </ul>
          </div>
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
