import { useEffect, useState } from "react";
import { PencilSparkles, X, Folder, Loader2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Category } from "@/types/category";
import { createClient } from "@/lib/supabase/client";

interface categoryProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

// Suggested categories array
const SUGGESTED_CATEGORIES = [
  "Food",
  "Rent/Housing",
  "Transport",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Other",
];

export default function AddCategory({
  isOpen,
  onClose,
  userId,
}: categoryProps) {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null,
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const fetchUserCategories = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("category", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error fetching categories:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserCategories();
    }
  }, [isOpen, userId]);

  const insertCategory = async (categoryName: string) => {
    if (!userId) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from("categories").insert([
        {
          category: categoryName,
          user_id: userId,
        },
      ]);

      if (error) throw error;

      fetchUserCategories();
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to create category");
      console.error("Error creating category:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    await insertCategory(newCategoryName.trim());
    setNewCategoryName("");
  };

  const handleSuggestionClick = (categoryName: string) => {
    const alreadyExists = categories.some(
      (cat) => cat.category.toLowerCase() === categoryName.toLowerCase(),
    );
    if (alreadyExists) {
      setErrorMsg(`"${categoryName}" is already in your categories.`);
      return;
    }

    setSelectedSuggestion(categoryName);
    setIsConfirmOpen(true);
  };

  const handleConfirmAddSuggestion = async () => {
    if (selectedSuggestion) {
      await insertCategory(selectedSuggestion);
      setSelectedSuggestion(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
        <div
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          onClick={onClose}
        />
        <div className="relative w-full glass-panel max-w-lg overflow-hidden border rounded-2xl shadow-2xl text-white z-10 animate-scaleUp bg-slate-900 border-white/10">
          <div className="h-1.5 w-full bg-gradient-to-r from-green-500 via-indigo-500 to-pink-500" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl border border-white/5 bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <div className="border-b border-white/10 pb-4">
                <h1 className="w-fit font-bold text-xl flex flex-row items-center gap-2 bg-gradient-to-r from-white via-rose-200 to-indigo-300 bg-clip-text text-transparent">
                  <PencilSparkles className="h-4 w-4 text-slate-200" />
                  Manage Categories
                </h1>
                <span className="text-xs text-slate-400">
                  Be creative and organize your budget
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-2">
              <label className="text-xs font-medium text-slate-400 block">
                Create New Category
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Groceries, Coffee, Utilities"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  disabled={submitting}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={submitting || !newCategoryName.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 disabled:text-slate-400 transition text-sm font-semibold rounded-xl text-white cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add
                </button>
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-400 font-medium mt-1">
                  {errorMsg}
                </p>
              )}
            </form>

            <div className="space-y-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Quick Suggestions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_CATEGORIES.map((suggested) => {
                  const isExisting = categories.some(
                    (cat) =>
                      cat.category.toLowerCase() === suggested.toLowerCase(),
                  );
                  return (
                    <button
                      key={suggested}
                      type="button"
                      onClick={() => handleSuggestionClick(suggested)}
                      disabled={isExisting || submitting}
                      className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer font-medium ${
                        isExisting
                          ? "bg-white/5 border-white/5 text-slate-500 line-through cursor-not-allowed"
                          : "bg-slate-800/80 hover:bg-indigo-600/20 border-slate-700/50 hover:border-indigo-500/50 text-slate-300"
                      }`}
                    >
                      {suggested}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-white/10" />

            <div className="space-y-3">
              <h3 className="text-xs font-medium text-slate-400">
                Your Categories
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-6 text-slate-400 gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500 border border-dashed border-white/5 rounded-xl">
                  No categories created yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-sm"
                    >
                      <Folder className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="truncate text-slate-200">
                        {cat.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="z-[110] bg-slate-900 border border-white/10 text-white max-w-sm rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Add "{selectedSuggestion}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-sm">
              Would you like to add this to your personal list of transaction / Budget
              categories?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="bg-white/5 hover:bg-white/10 border-white/5 hover:text-white rounded-lg text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAddSuggestion}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
