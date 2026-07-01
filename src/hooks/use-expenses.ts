'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Expense } from '@/types/expense';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchExpenses = useCallback(async (month?: number, year?: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (month && year) {
        // Build timestamp ranges for month
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setExpenses(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch expenses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const addExpense = useCallback(async (expenseData: {
    title: string;
    amount: number;
    category: string;
    date: string;
    note?: string | null;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert({
          ...expenseData,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setExpenses((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to add expense');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const deleteExpense = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    addExpense,
    deleteExpense,
  };
}
