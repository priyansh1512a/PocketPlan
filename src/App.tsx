import { useState } from 'react';
import { useData } from '@/hooks/useData';
import { Overview } from '@/views/Overview';
import { AccountsView } from '@/views/AccountsView';
import { GoalsView } from '@/views/GoalsView';
import { BudgetsView } from '@/views/BudgetsView';
import { SpendingView } from '@/views/SpendingView';
import { BillsView } from '@/views/BillsView';
import { Wallet, Target, Gauge, TrendingDown, CalendarClock, LayoutDashboard, RefreshCw } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'accounts', label: 'Accounts', icon: Wallet },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'budgets', label: 'Budget', icon: Gauge },
  { id: 'spending', label: 'Spending', icon: TrendingDown },
  { id: 'bills', label: 'Bills', icon: CalendarClock },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function App() {
  const [tab, setTab] = useState<TabId>('overview');
  const { accounts, goals, budgets, transactions, bills, loading, error, refresh } = useData();

  const billCount = bills.filter((b) => !b.is_paid).length;

  const content = () => {
    if (error) {
      return (
        <div className="card text-center py-16">
          <p className="font-display font-bold text-orange-600 mb-2">Something went wrong</p>
          <p className="text-sm text-purple-400 mb-4">{error}</p>
          <button className="btn-primary mx-auto" onClick={refresh}>
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      );
    }
    if (loading) {
      return (
        <div className="space-y-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-purple-100 rounded-lg w-1/3 mb-3" />
              <div className="h-3 bg-purple-50 rounded-lg w-2/3" />
            </div>
          ))}
        </div>
      );
    }
    switch (tab) {
      case 'accounts':
        return <AccountsView accounts={accounts} onChanged={refresh} />;
      case 'goals':
        return <GoalsView goals={goals} onChanged={refresh} />;
      case 'budgets':
        return <BudgetsView budgets={budgets} transactions={transactions} onChanged={refresh} />;
      case 'spending':
        return <SpendingView transactions={transactions} accounts={accounts} budgets={budgets} onChanged={refresh} />;
      case 'bills':
        return <BillsView bills={bills} accounts={accounts} onChanged={refresh} />;
      default:
        return <Overview accounts={accounts} transactions={transactions} goals={goals} budgets={budgets} bills={bills} onTabChange={(t) => setTab(t as TabId)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-purple-100/90 backdrop-blur border-b border-purple-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center text-purple-50 font-display font-extrabold text-lg">P</div>
            <span className="font-display font-extrabold text-xl text-purple-900 tracking-tight">PocketPlan</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  tab === t.id ? 'bg-purple-200 text-purple-800' : 'text-purple-300 hover:text-purple-600 hover:bg-purple-200/60'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <t.icon size={16} /> {t.label}
                </span>
                {t.id === 'bills' && billCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {billCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-purple-900">
            {tab === 'overview' && `Welcome back`}
            {tab === 'accounts' && 'Your accounts'}
            {tab === 'goals' && 'Savings goals'}
            {tab === 'budgets' && 'Monthly budgets'}
            {tab === 'spending' && 'Spending & income'}
            {tab === 'bills' && 'Bills & reminders'}
          </h1>
          <p className="text-sm text-purple-400 mt-1">
            {tab === 'overview' && 'Here is how your money is doing today.'}
            {tab === 'accounts' && 'Keep every balance in one place.'}
            {tab === 'goals' && 'Watch your savings grow step by step.'}
            {tab === 'budgets' && 'Set limits and stay inside them.'}
            {tab === 'spending' && 'Track where every dollar goes.'}
            {tab === 'bills' && 'Never miss a payment again.'}
          </p>
        </div>
        {content()}
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-purple-100 border-t border-purple-200 px-2 py-1.5 flex justify-between">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-semibold transition-colors ${
              tab === t.id ? 'text-purple-700' : 'text-purple-300'
            }`}          >
            <t.icon size={20} />
            {t.label}
            {t.id === 'bills' && billCount > 0 && (
              <span className="absolute top-0 right-2 w-3.5 h-3.5 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                {billCount}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
