import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Account, Goal, Budget, Transaction, Bill } from './lib/types';

interface DataState {
  accounts: Account[];
  goals: Goal[];
  budgets: Budget[];
  transactions: Transaction[];
  bills: Bill[];
  loading: boolean;
  error: string | null;
}

export function useData() {
  const [state, setState] = useState<DataState>({
    accounts: [],
    goals: [],
    budgets: [],
    transactions: [],
    bills: [],
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const [accounts, goals, budgets, transactions, bills] = await Promise.all([
      supabase.from('accounts').select('*').order('created_at'),
      supabase.from('goals').select('*').order('created_at'),
      supabase.from('budgets').select('*').order('created_at'),
      supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100),
      supabase.from('bills').select('*').order('due_day'),
    ]);
    const error = accounts.error || goals.error || budgets.error || transactions.error || bills.error;
    if (error) {
      setState((s) => ({ ...s, loading: false, error: error.message }));
      return;
    }
    setState({
      accounts: accounts.data ?? [],
      goals: goals.data ?? [],
      budgets: budgets.data ?? [],
      transactions: transactions.data ?? [],
      bills: bills.data ?? [],
      loading: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
