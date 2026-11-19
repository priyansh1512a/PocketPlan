import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { supabase } from '@/lib/supabase';
import { formatCurrency, currentMonth } from '@/lib/format';
import type { Bill, Accent } from '@/lib/types';
import { Plus, Trash2, CalendarClock, CheckCircle2, Circle } from 'lucide-react';

interface BillsProps {
  bills: Bill[];
  accounts: Account_;
  onChanged: () => void;
}
type Account_ = { id: string; name: string; balance: number };

const CATEGORIES = ['Housing', 'Utilities', 'Transport', 'Health', 'Fun', 'Other'];

const accents: { value: Accent; swatch: string; bar: string }[] = [
  { value: 'purple', swatch: 'bg-purple-500', bar: 'bg-purple-500' },
  { value: 'mint', swatch: 'bg-mint-500', bar: 'bg-mint-500' },
  { value: 'orange', swatch: 'bg-orange-500', bar: 'bg-orange-500' },
];

export function BillsView({ bills, accounts, onChanged }: BillsProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [category, setCategory] = useState('Utilities');
  const [accountId, setAccountId] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const month = currentMonth();
  const [year, monthNum] = month.split('-').map(Number);
  const monthName = new Date(year, monthNum - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayDay = new Date().getDate();

  const dueSoon = bills.filter((b) => !b.is_paid && b.due_day >= todayDay);
  const unpaidTotal = bills.filter((b) => !b.is_paid).reduce((s, b) => s + Number(b.amount), 0);

  async function handleAdd() {
    const day = Number(dueDay);
    if (!name.trim() || !amount || Number(amount) <= 0 || !day || day < 1 || day > 31) {
      setFormError('Please enter a bill name, an amount, and a due day between 1 and 31.');
      return;
    }
    setSaving(true);
    setFormError(null);
    const { error } = await supabase.from('bills').insert({
      name: name.trim(),
      amount: Number(amount),
      due_day: day,
      category,
    });
    setSaving(false);
    if (error) {
      setFormError('Could not save the bill. Please try again.');
      return;
    }
    setOpen(false);
    setName('');
    setAmount('');
    setAccountId('');
    onChanged();
  }

  async function togglePaid(bill: Bill) {
    if (bill.is_paid) {
      await supabase.from('bills').update({ is_paid: false, paid_month: null }).eq('id', bill.id);
      onChanged();
      return;
    }
    await supabase.from('bills').update({ is_paid: true, paid_month: month }).eq('id', bill.id);
    if (accountId) {
      const acct = accounts.find((a) => a.id === accountId);
      if (acct) {
        await supabase
          .from('accounts')
          .update({ balance: Number(acct.balance) - Number(bill.amount) })
          .eq('id', accountId);
        await supabase.from('transactions').insert({
          description: `Bill: ${bill.name}`,
          amount: Number(bill.amount),
          type: 'expense',
          category: bill.category,
          account_id: accountId,
          date: new Date().toISOString().slice(0, 10),
        });
      }
    }
    onChanged();
  }

  async function handleDelete(id: string) {
    await supabase.from('bills').delete().eq('id', id);
    onChanged();
  }

  const sorted = [...bills].sort((a, b) => Number(a.is_paid) - Number(b.is_paid) || a.due_day - b.due_day);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <CalendarClock size={22} />
          </div>
          <div>
            <p className="text-sm text-purple-400">Unpaid bills total</p>
            <p className="font-display font-bold text-lg text-purple-900">{formatCurrency(unpaidTotal)}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-mint-100 text-mint-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-sm text-purple-400">Next due</p>
            <p className="font-display font-bold text-lg text-purple-900">
              {dueSoon.length > 0 ? `Day ${Math.min(...dueSoon.map((b) => b.due_day))} · ${dueSoon[0].name}` : 'All caught up'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-purple-500">{monthName} · mark bills as you pay them</p>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={18} /> Add bill
        </button>
      </div>

      {bills.length === 0 ? (
        <div className="card text-center py-12">
          <CalendarClock className="mx-auto text-purple-300 mb-3" size={40} />
          <p className="font-display font-bold text-purple-900 mb-1">No bills yet</p>
          <p className="text-sm text-purple-400 mb-4">Add recurring bills like rent, internet, or subscriptions.</p>
          <button className="btn-primary mx-auto" onClick={() => setOpen(true)}>
            <Plus size={18} /> Add bill
          </button>
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <ul className="divide-y divide-purple-200">
            {sorted.map((b) => (
              <li key={b.id} className="flex items-center gap-3 px-5 py-4 hover:bg-purple-200/40 transition-colors group">
                <button onClick={() => togglePaid(b)} aria-label={b.is_paid ? 'Mark unpaid' : 'Mark paid'} className="shrink-0">
                  {b.is_paid ? (
                    <CheckCircle2 size={24} className="text-mint-500 hover:text-mint-600 transition-colors" />
                  ) : (
                    <Circle size={24} className="text-purple-300 hover:text-purple-500 transition-colors" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium text-sm truncate ${b.is_paid ? 'text-purple-300 line-through' : 'text-purple-900'}`}>{b.name}</p>
                  <p className="text-xs text-purple-400">
                    Due day {b.due_day} · {b.category}
                    {!b.is_paid && b.due_day < todayDay && <span className="ml-2 font-semibold text-orange-600">overdue</span>}
                  </p>
                </div>
                <p className={`font-semibold text-sm shrink-0 ${b.is_paid ? 'text-purple-300' : 'text-purple-900'}`}>{formatCurrency(Number(b.amount))}</p>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-1.5 rounded-lg text-purple-300 hover:text-orange-600 hover:bg-orange-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all shrink-0"
                  aria-label={`Delete ${b.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal open={open} title="Add a recurring bill" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="field-label">Bill name</label>
            <input className="field-input" placeholder="e.g. Internet" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Amount</label>
              <input className="field-input" type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Due day of month</label>
              <input className="field-input" type="number" min="1" max="31" placeholder="1" value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="field-label">Category</label>
            <select className="field-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Pay from account (optional)</label>
            <select className="field-input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">Just mark as paid</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            {accountId && <p className="text-xs text-purple-400 mt-1.5">Marking as paid will subtract the amount from this account and log it as spending.</p>}
          </div>
          {formError && <p className="text-sm text-orange-600 font-medium">{formError}</p>}
          <button className="btn-primary w-full justify-center" onClick={handleAdd} disabled={saving}>
            {saving ? 'Saving…' : 'Add bill'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
