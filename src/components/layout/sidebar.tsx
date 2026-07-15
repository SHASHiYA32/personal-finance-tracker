'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  PiggyBank, 
  LineChart, 
  Settings, 
  LogOut,
  Sparkles,
  CalendarSearch,
  Vault,
  Briefcase
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const menuItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Income', href: '/income', icon: Wallet },
  { name: 'Budget', href: '/budget', icon: PiggyBank },
  { name: 'Calendar', href: '/calender', icon: CalendarSearch },
  { name: 'Analytics', href: '/analytics', icon: LineChart },
  { name: 'Vault', href: '/vault', icon: Briefcase },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 hidden md:flex flex-col z-30 p-4">
      <div className="glass-panel h-full w-full flex flex-col justify-between p-6">
        <div>
          <a href='/dashboard' className="flex items-center gap-2 mb-8">
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

          {/* Navigation Links */}
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
                      ? 'text-white bg-indigo-600/10 border border-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 group"
          >
            <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
