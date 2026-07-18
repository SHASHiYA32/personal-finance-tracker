"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  Receipt,
  Wallet,
  PiggyBank,
  LineChart,
  Settings,
  LogOut,
  User,
  CalendarSearch,
  Briefcase,
  ShieldUser,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Income", href: "/income", icon: Wallet },
  { name: "Budget", href: "/budget", icon: PiggyBank },
  { name: "Calendar", href: "/calender", icon: CalendarSearch },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Vault", href: "/vault", icon: Briefcase },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [joinedAt, setJoinedAt] = useState<string | null>(null);

  useEffect(() => {
    async function getUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        const authProvider = user.app_metadata?.provider || null;
        setProvider(authProvider);

        const metadataName =
          user.user_metadata?.full_name || user.user_metadata?.name;
        const metadataAvatar = user.user_metadata?.avatar_url;

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url, created_at")
          .eq("id", user.id)
          .single();

        setDisplayName(
          profile?.display_name ||
            metadataName ||
            user.email?.split("@")[0] ||
            null,
        );
        setAvatarUrl(profile?.avatar_url || metadataAvatar || null);

        if (profile?.created_at) {
          setJoinedAt(
            new Date(profile.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            }),
          );
        }
      }
    }
    getUserData();
  }, [supabase]);

  const renderProviderIcon = (provider: string | null) => {
    if (!provider) return null;
    const normalizedProvider = provider.toLowerCase().trim();
    switch (normalizedProvider) {
      case "google":
        return (
          <div className="absolute -bottom-1 -right-1 h-4.5 w-4.5 rounded-full bg-slate-900 border border-white/10 p-0.5 flex items-center justify-center shadow-lg">
            <svg className="h-3 w-3" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.42-4.51 6.76-4.51z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.44-1.09 2.66-2.31 3.48l3.6 2.79c2.1-1.94 3.76-4.79 3.76-8.37z"
              />
              <path
                fill="#FBBC05"
                d="M5.24 14.55c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.39 7.56C.5 9.35 0 11.35 0 13.5s.5 4.15 1.39 5.94l3.85-2.89z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.6-2.79c-1.1.74-2.52 1.18-4.36 1.18-3.34 0-5.86-1.81-6.76-4.51L1.39 16.86C3.37 20.33 7.35 23 12 23z"
              />
            </svg>
          </div>
        );
      case "facebook":
        return (
          <div className="absolute -bottom-1 -right-1 h-4.5 w-4.5 rounded-full bg-[#1877F2] border border-white/10 flex items-center justify-center shadow-lg">
            <svg className="h-2.5 w-2.5 fill-white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
        );
      case "apple":
        return (
          <div className="absolute -bottom-1 -right-1 h-4.5 w-4.5 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-lg">
            <svg className="h-2.5 w-2.5 fill-white" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.56 2.95-1.39z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <header className="w-full h-20 flex items-center justify-between px-6 md:px-12 z-20 sticky top-0 bg-transparent">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden md:block px-7 py-2 rounded-xl backdrop-blur-xl">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex flex-row items-center gap-2">
              Hello, {displayName} <ShieldUser className="text-amber-500"/>
            </h2>
          </div>
        </div>

        <button
          onClick={() => setProfileModalOpen(true)}
          className="flex items-center gap-4 rounded-2xl backdrop-blur-2xl transition-transform active:scale-95"
        >
          <div className="glass-panel py-2 px-4 flex items-center gap-3 bg-white/[0.02] border-white/5">
            <div className="relative h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white uppercase">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                displayName?.[0]
              )}
            </div>
          </div>
        </button>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed glass-panel top-0 left-0 w-80 h-full bg-slate-900 border-r border-white/10 p-6 z-50 flex flex-col justify-between"
            >
              <div className="flex flex-col gap-5 mt-8">
                <a href="/dashboard" className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                      AuraFinance
                    </h1>
                    <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                      Premium Tracking
                    </p>
                  </div>
                </a>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden group ${
                          isActive
                            ? "text-white bg-indigo-600/10 border border-indigo-500/20"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-indicator"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r"
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        )}
                        <Icon
                          className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                            isActive
                              ? "text-indigo-400"
                              : "text-slate-400 group-hover:text-slate-200"
                          }`}
                        />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 mb-3"
              >
                <LogOut className="h-5 w-5" /> Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {profileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setProfileModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel w-full max-w-sm bg-slate-900/90 border border-white/10 p-6 rounded-3xl flex flex-col items-center text-center"
            >
              <div className="h-20 w-20 rounded-full bg-indigo-500 mb-4 flex items-center justify-center text-2xl font-bold text-white">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  displayName?.[0]
                )}
              </div>
              <h3 className="text-xl font-bold text-white">{displayName}</h3>
              <p className="text-sm text-slate-400 mb-6">{userEmail}</p>
              <div className="w-full space-y-3 text-sm text-left mb-8 border-t border-white/10 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider</span>
                  <span className="text-white capitalize">
                    {provider || "Email"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Member Since</span>
                  <span className="text-white">{joinedAt || "Loading..."}</span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 border border-red-500/20"
              >
                <LogOut className="h-5 w-5" /> Sign Out
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
