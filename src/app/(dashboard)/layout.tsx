import Sidebar from '@/components/layout/sidebar';
import Navbar from '@/components/layout/navbar';
import { FinanceAssistant } from '@/components/ai/FinanceAssistant';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex text-slate-100 bg-transparent">
      <Sidebar />
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 pt-2">
          {children}
          <FinanceAssistant />
        </main>
      </div>
    </div>
  );
}
