import { PencilSparkles, X } from "lucide-react";

interface categoryProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export default function AddCategory({
  isOpen,
  onClose,
  userId,
}: categoryProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Darkened blur frosted glass backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full glass-panel max-w-lg overflow-hidden border rounded-2xl shadow-2xl text-white z-10 animate-scaleUp">
        {/* Top subtle highlight layout glow banner */}
        <div className="h-1.5 w-full bg-gradient-to-r from-green-500 via-indigo-500 to-pink-500" />

        {/* Close Button Trigger Action */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl border border-white/5 bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <div className="border-b pb-4">
              <h1 className="w-fit font-bold text-xl flex flex-row items-center gap-2 bg-gradient-to-r from-white via-rose-200 to-indigo-300 bg-clip-text text-transparent">
                <PencilSparkles className="h-4 w-4 text-slate-200" />
                New Category
              </h1>
              <span className="text-xs text-muted-foreground">
                Be creative and organize your budget
              </span>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
