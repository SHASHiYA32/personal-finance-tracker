'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Income } from '@/types/income';

export function useIncome() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchIncomes = useCallback(async (month?: number, year?: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (month && year) {
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setIncomes(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch incomes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const addIncome = useCallback(async (incomeData: {
    source: string;
    amount: number;
    date: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: insertError } = await supabase
        .from('income')
        .insert({
          ...incomeData,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setIncomes((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to add income');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const deleteIncome = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('income')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setIncomes((prev) => prev.filter((inc) => inc.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete income');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    incomes,
    loading,
    error,
    fetchIncomes,
    addIncome,
    deleteIncome,
  };
}
