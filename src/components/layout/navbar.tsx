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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
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

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();

        if (profile?.display_name) {
          setDisplayName(profile.display_name);
        } else {
          setDisplayName(user.email ? user.email.split("@")[0] : "User");
        }
      }
    }
    getUser();
  }, [supabase]);

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
          .select("display_name, avatar_url")
          .eq("id", user.id)
          .single();

        setDisplayName(
          profile?.display_name ||
            metadataName ||
            user.email?.split("@")[0] ||
            null,
        );
        setAvatarUrl(profile?.avatar_url || metadataAvatar || null);
      }
    }
    getUserData();
  }, []);

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
      case "Email, Facebook":
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

  // Get current page name based on route
  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Overview";
      case "/expenses":
        return "Expenses";
      case "/income":
        return "Income Streams";
      case "/budget":
        return "Budgets";
      case "/analytics":
        return "Visual Analytics";
      case "/calender":
        return "Calendar";
      case "/vault":
        return "Vault";
      case "/settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  return (
    <>
      <header className="w-full h-20 flex items-center justify-between px-6 md:px-12 z-20 sticky top-0 bg-transparent">
        {/* Page Title (Desktop) & Brand Logo (Mobile) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="px-7 py-2 rounded-xl backdrop-blur-xl">
            <h2 className="hidden md:block text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {getPageTitle()}
            </h2>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-indigo-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white">AuraFinance</span>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-4 rounded-2xl backdrop-blur-2xl">
          <div className="glass-panel py-2 px-4 flex items-center gap-3 bg-white/[0.02] border-white/5">
            <div className="relative flex items-center justify-center">
              <div className="relative h-8 w-8 rounded-full">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName || "User avatar"}
                    className="h-full w-full rounded-full object-cover border border-white/10 shadow-md shadow-indigo-500/10 hover:border-indigo-500/40 transition-all"
                    onError={() => setAvatarUrl(null)}
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-md shadow-indigo-500/10 hover:scale-102 transition-all">
                    {displayName ? (
                      displayName[0]
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                )}

                {provider && (
                  <div className="absolute -bottom-1 -right-1 z-30">
                    {renderProviderIcon(provider)}
                  </div>
                )}
              </div>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-400 leading-none">
                {userEmail}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-over Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] glass-panel rounded-r-2xl rounded-l-none border-l-0 border-y-0 h-full p-6 z-50 md:hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                      <Sparkles className="h-4.5 w-4.5 text-white" />
                    </div>
                    <span className="font-bold text-lg text-white">
                      AuraFinance
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? "text-white bg-indigo-600/20 border border-indigo-500/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
