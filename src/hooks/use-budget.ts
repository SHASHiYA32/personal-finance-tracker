'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Budget } from '@/types/budget';

export function useBudget() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchBudgets = useCallback(async (month: number, year: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: fetchError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year);

      if (fetchError) throw fetchError;
      setBudgets(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch budgets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const setBudget = useCallback(async (
    category: string,
    monthly_limit: number,
    month: number,
    year: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: upsertError } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          category,
          monthly_limit,
          month,
          year
        }, {
          onConflict: 'user_id,category,month,year'
        })
        .select()
        .single();

      if (upsertError) throw upsertError;

      setBudgets((prev) => {
        const index = prev.findIndex((b) => b.category === category && b.month === month && b.year === year);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = data;
          return updated;
        }
        return [...prev, data];
      });

      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to set budget');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const deleteBudget = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete budget');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    setBudget,
    deleteBudget,
  };
}
