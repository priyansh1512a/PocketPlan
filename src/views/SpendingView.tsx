import { useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate, currentMonth } from '@/lib/format';
import type { Transaction, Account, Budget } from '@/lib/types';
import { Plus, Trash2, TrendingDown, TrendingUp, PieChart } from 'lucide-react';

interface SpendingProps {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  onChanged: () => void;
}

const CATEGORIES = ['Food', 'Groceries', 'Transport', 'Shopping', 'Housing', 'Utilities', 'Health', 'Fun', 'Other'];

const barColors = ['bg-purple-500', 'bg-mint-500', 'bg-orange-500', 'bg-purple-400', 'bg-mint-400', 'bg-orange-400'];

export function SpendingView({ transactions, accounts, budgets, onChanged }: SpendingProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Food');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const month = currentMonth();
  const monthTx = useMemo(
    () => transactions.filter((t) => t.date.startsWith(month)),
    [transactions, month]
  );
  const spent = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    monthTx.filter((t) => t.type === 'expense').forEach((t) => {
      map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount));
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [monthTx]);

  const visible = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const budgetFor = (cat: string) => budgets.find((b) => b.category === cat);

  async function handleAdd() {
    if (!description.trim() || !amount || Number(amount) <= 0) {
      setFormError('Please enter a description and an amount greater than zero.');
      return;
    }
    setSaving(true);
    setFormError(null);
    const { error } = await supabase.from('transactions').insert({
      description: description.trim(),
      amount: Number(amount),
      type,
      category: type === 'income' ? 'Income' : category,
      account_id: accountId || null,
      date,
    });
    setSaving(false);
    if (error) {
      setFormError('Could not save the transaction. Please try again.');
      return;
    }
    setOpen(false);
    setDescription('');
    setAmount('');
    setAccountId('');
    onChanged();
  }

  async function handleDelete(id: string) {
    await supabase.from('transactions').delete().eq('id', id);
    onChanged();
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <TrendingDown size={22} />
          </div>
          <div>
            <p className="text-sm text-purple-400">Spent this month</p>
            <p className="font-display font-bold text-lg text-purple-900">{formatCurrency(spent)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-mint-100 text-mint-600 flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-sm text-purple-400">Income this month</p>
            <p className="font-display font-bold text-lg text-purple-900">{formatCurrency(income)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <PieChart size={22} />
          </div>
          <div>
            <p className="text-sm text-purple-400">Net this month</p>
            <p className={`font-display font-bold text-lg ${income - spent >= 0 ? 'text-mint-600' : 'text-orange-600'}`}>
              {formatCurrency(income - spent)}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-display font-bold text-purple-900 mb-4">Where your money went this month</h3>
        {byCategory.length === 0 ? (
          <p className="text-sm text-purple-400">No spending recorded this month yet.</p>
        ) : (
          <div className="space-y-3">
            {byCategory.map(([cat, total], i) => {
              const pct = (total / spent) * 100;
              const budget = budgetFor(cat);
              const over = budget ? total > Number(budget.limit_amount) : false;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-purple-800">
                      {cat}
                      {budget && <span className="ml-2 text-xs font-medium text-purple-400">budget {formatCurrency(Number(budget.limit_amount))}</span>}
                    </span>
                    <span className={`font-semibold ${over ? 'text-orange-600' : 'text-purple-500'}`}>{formatCurrency(total)}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-purple-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-orange-500' : barColors[i % barColors.length]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-purple-200 rounded-xl p-1">
          {(['all', 'expense', 'income'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                filter === f ? 'bg-purple-500 text-purple-50 shadow-sm' : 'text-purple-300 hover:text-purple-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={18} /> Add transaction
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        {visible.length === 0 ? (
          <p className="text-sm text-purple-400 p-6">No transactions yet. Add one to start tracking.</p>
        ) : (
          <ul className="divide-y divide-purple-200">
            {visible.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-purple-200/40 transition-colors group">
                <div className="min-w-0">
                  <p className="font-medium text-purple-900 text-sm truncate">{t.description}</p>
                  <p className="text-xs text-purple-400">
                    {t.category} · {formatDate(t.date)}
                    {t.account_id && accountMap.get(t.account_id) ? ` · ${accountMap.get(t.account_id)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className={`font-semibold text-sm ${t.type === 'income' ? 'text-mint-600' : 'text-orange-600'}`}>
                    {t.type === 'income' ? '+' : '-'}
                    {formatCurrency(Number(t.amount))}
                  </p>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-lg text-purple-300 hover:text-orange-600 hover:bg-orange-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                    aria-label="Delete transaction"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={open} title="Add a transaction" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize border transition-all ${
                  type === t
                    ? t === 'expense'
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : 'border-mint-400 bg-mint-50 text-mint-700'
                    : 'border-purple-200 text-purple-400 hover:bg-purple-200/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div>
            <label className="field-label">Description</label>
            <input className="field-input" placeholder="e.g. Weekly groceries" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Amount</label>
              <input className="field-input" type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Date</label>
              <input className="field-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          {type === 'expense' && (
            <div>
              <label className="field-label">Category</label>
              <select className="field-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="field-label">Account (optional)</label>
            <select className="field-input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">No account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          {formError && <p className="text-sm text-orange-600 font-medium">{formError}</p>}
          <button className="btn-primary w-full justify-center" onClick={handleAdd} disabled={saving}>
            {saving ? 'Saving…' : 'Add transaction'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
