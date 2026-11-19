import { formatCurrency, currentMonth } from '@/lib/format';
import type { Account, Transaction, Goal, Budget, Bill } from '@/lib/types';
import { Wallet, TrendingDown, TrendingUp, Target, CalendarClock, ArrowRight } from 'lucide-react';

interface OverviewProps {
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  bills: Bill[];
  onTabChange: (tab: string) => void;
}

export function Overview({ accounts, transactions, goals, budgets, bills, onTabChange }: OverviewProps) {
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const month = currentMonth();
  const monthTx = transactions.filter((t) => t.date.startsWith(month));
  const monthSpent = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const monthIncome = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalBudget = budgets.reduce((s, b) => s + Number(b.limit_amount), 0);
  const upcomingBills = bills.filter((b) => !b.is_paid);
  const unpaidTotal = upcomingBills.reduce((s, b) => s + Number(b.amount), 0);

  const stats = [
    { label: 'Total balance', value: formatCurrency(totalBalance), icon: Wallet, color: 'bg-purple-100 text-purple-600' },
    { label: 'Spent this month', value: formatCurrency(monthSpent), icon: TrendingDown, color: 'bg-orange-100 text-orange-600' },
    { label: 'Income this month', value: formatCurrency(monthIncome), icon: TrendingUp, color: 'bg-mint-100 text-mint-600' },
    { label: 'Bills due', value: formatCurrency(unpaidTotal), icon: CalendarClock, color: 'bg-purple-100 text-purple-600' },
  ];

  const recent = monthTx.slice(0, 5);
  const budgetUsed = totalBudget > 0 ? Math.min(100, (monthSpent / totalBudget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-purple-400">{s.label}</p>
              <p className="font-display font-bold text-lg text-purple-900 truncate">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-purple-900">Monthly budget</h3>
            <button onClick={() => onTabChange('budget')} className="text-sm font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1">
              Manage <ArrowRight size={14} />
            </button>
          </div>
          {totalBudget === 0 ? (
            <p className="text-sm text-purple-400">No budgets set yet — create one to track your spending.</p>
          ) : (
            <>
              <p className="text-sm text-purple-500 mb-2">
                <span className="font-bold text-purple-900">{formatCurrency(monthSpent)}</span> of {formatCurrency(totalBudget)} used
              </p>
              <div className="h-3 rounded-full bg-purple-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${budgetUsed >= 100 ? 'bg-orange-500' : 'bg-mint-500'}`}
                  style={{ width: `${budgetUsed}%` }}
                />
              </div>
              <p className={`text-xs mt-2 font-medium ${budgetUsed >= 100 ? 'text-orange-600' : 'text-mint-600'}`}>
                {budgetUsed >= 100 ? 'Over budget this month' : `${Math.round(100 - budgetUsed)}% left to spend`}
              </p>
            </>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-purple-900">Goals progress</h3>
            <button onClick={() => onTabChange('goals')} className="text-sm font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          {goals.length === 0 ? (
            <p className="text-sm text-purple-400">No goals yet — add one to start saving.</p>
          ) : (
            <div className="space-y-3">
              {goals.slice(0, 3).map((g) => {
                const pct = Math.min(100, (Number(g.saved_amount) / Number(g.target_amount)) * 100) || 0;
                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-purple-800 flex items-center gap-1.5">
                        <Target size={14} className="text-purple-400" /> {g.name}
                      </span>
                      <span className="text-purple-400">{Math.round(pct)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-purple-100 overflow-hidden">
                      <div className="h-full rounded-full bg-purple-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-purple-900">Recent activity</h3>
          <button onClick={() => onTabChange('spending')} className="text-sm font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1">
            All spending <ArrowRight size={14} />
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-purple-400">Nothing yet — your latest transactions will appear here.</p>
        ) : (
          <ul className="divide-y divide-purple-200">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="font-medium text-purple-900 text-sm">{t.description}</p>
                  <p className="text-xs text-purple-400">
                    {t.category} · {t.date}
                  </p>
                </div>
                <p className={`font-semibold text-sm ${t.type === 'income' ? 'text-mint-600' : 'text-orange-600'}`}>
                  {t.type === 'income' ? '+' : '-'}
                  {formatCurrency(Number(t.amount))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
