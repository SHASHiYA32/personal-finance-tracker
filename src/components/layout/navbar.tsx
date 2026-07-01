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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Income", href: "/income", icon: Wallet },
  { name: "Budget", href: "/budget", icon: PiggyBank },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);

        // Fetch public profile for display name
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Get current page name based on route
  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Overview";
      case "/expenses":
        return "Expenses";
      case "/income":
        return "Income Streams";
      case "/budget":
        return "Budgets";
      case "/analytics":
        return "Visual Analytics";
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
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-md shadow-indigo-500/10">
              {displayName ? displayName[0] : <User className="h-4 w-4" />}
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
