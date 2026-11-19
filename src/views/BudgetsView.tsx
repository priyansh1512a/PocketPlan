import { useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { supabase } from '@/lib/supabase';
import { formatCurrency, currentMonth } from '@/lib/format';
import type { Budget, Transaction, Accent } from '@/lib/types';
import { Plus, Trash2, Gauge } from 'lucide-react';

interface BudgetsProps {
  budgets: Budget[];
  transactions: Transaction[];
  onChanged: () => void;
}

const CATEGORIES = ['Food', 'Groceries', 'Transport', 'Shopping', 'Housing', 'Utilities', 'Health', 'Fun', 'Other'];

const accents: { value: Accent; label: string; swatch: string; bar: string }[] = [
  { value: 'purple', label: 'Purple', swatch: 'bg-purple-500', bar: 'bg-purple-500' },
  { value: 'mint', label: 'Mint', swatch: 'bg-mint-500', bar: 'bg-mint-500' },
  { value: 'orange', label: 'Orange', swatch: 'bg-orange-500', bar: 'bg-orange-500' },
];

export function BudgetsView({ budgets, transactions, onChanged }: BudgetsProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [color, setColor] = useState<Accent>('orange');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const month = currentMonth();
  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(month))
      .forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount)));
    return map;
  }, [transactions, month]);

  const totalLimit = budgets.reduce((s, b) => s + Number(b.limit_amount), 0);
  const totalSpent = budgets.reduce((s, b) => s + (spentByCategory.get(b.category) ?? 0), 0);

  async function handleAdd() {
    if (!limit || Number(limit) <= 0) {
      setFormError('Please enter a monthly limit greater than zero.');
      return;
    }
    if (budgets.some((b) => b.category === category)) {
      setFormError(`You already have a budget for ${category}.`);
      return;
    }
    setSaving(true);
    setFormError(null);
    const { error } = await supabase.from('budgets').insert({
      category,
      limit_amount: Number(limit),
      color,
    });
    setSaving(false);
    if (error) {
      setFormError('Could not save the budget. Please try again.');
      return;
    }
    setOpen(false);
    setLimit('');
    onChanged();
  }

  async function handleDelete(id: string) {
    await supabase.from('budgets').delete().eq('id', id);
    onChanged();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-purple-500">
          {totalLimit > 0
            ? `${formatCurrency(totalSpent)} of ${formatCurrency(totalLimit)} used across all budgets`
            : 'Set monthly limits per category'}
        </p>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={18} /> New budget
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="card text-center py-12">
          <Gauge className="mx-auto text-purple-300 mb-3" size={40} />
          <p className="font-display font-bold text-purple-900 mb-1">No budgets yet</p>
          <p className="text-sm text-purple-400 mb-4">Create a monthly limit for a spending category to stay on track.</p>
          <button className="btn-primary mx-auto" onClick={() => setOpen(true)}>
            <Plus size={18} /> New budget
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const limitAmt = Number(b.limit_amount);
            const spent = spentByCategory.get(b.category) ?? 0;
            const pct = limitAmt > 0 ? Math.min(100, (spent / limitAmt) * 100) : 0;
            const over = spent > limitAmt;
            const remaining = limitAmt - spent;
            const accent = accents.find((a) => a.value === b.color) ?? accents[0];
            return (
              <div key={b.id} className="card group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-purple-900">{b.category}</p>
                    <p className="text-xs text-purple-400">Monthly limit {formatCurrency(limitAmt)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg text-purple-300 hover:text-orange-600 hover:bg-orange-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                    aria-label={`Delete ${b.category} budget`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="h-3 rounded-full bg-purple-100 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-orange-500' : accent.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className={`font-bold ${over ? 'text-orange-600' : 'text-purple-900'}`}>{formatCurrency(spent)}</span>
                    <span className="text-purple-400"> spent</span>
                  </p>
                  <p className={`text-xs font-bold ${over ? 'text-orange-600' : 'text-mint-600'}`}>
                    {over ? `${formatCurrency(-remaining)} over` : `${formatCurrency(remaining)} left`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} title="Create a monthly budget" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="field-label">Category</label>
            <select className="field-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Monthly limit</label>
            <input className="field-input" type="number" step="0.01" min="0" placeholder="0.00" value={limit} onChange={(e) => setLimit(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Color</label>
            <div className="flex gap-2">
              {accents.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setColor(a.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    color === a.value ? 'border-purple-400 bg-purple-200 text-purple-800' : 'border-purple-200 text-purple-400 hover:bg-purple-200/60'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${a.swatch}`} /> {a.label}
                </button>
              ))}
            </div>
          </div>
          {formError && <p className="text-sm text-orange-600 font-medium">{formError}</p>}
          <button className="btn-primary w-full justify-center" onClick={handleAdd} disabled={saving}>
            {saving ? 'Saving…' : 'Create budget'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
