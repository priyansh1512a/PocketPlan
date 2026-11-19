import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { AccountCard } from '@/components/AccountCard';
import { supabase } from '@/lib/supabase';
import type { Account, Accent } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';

interface AccountsProps {
  accounts: Account[];
  onChanged: () => void;
}

const accents: { value: Accent; label: string; swatch: string }[] = [
  { value: 'purple', label: 'Purple', swatch: 'bg-purple-500' },
  { value: 'mint', label: 'Mint', swatch: 'bg-mint-500' },
  { value: 'orange', label: 'Orange', swatch: 'bg-orange-500' },
];

export function AccountsView({ accounts, onChanged }: AccountsProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState<Accent>('purple');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleAdd() {
    if (!name.trim() || balance === '') {
      setFormError('Please give the account a name and a starting balance.');
      return;
    }
    setSaving(true);
    setFormError(null);
    const { error } = await supabase.from('accounts').insert({
      name: name.trim(),
      type,
      balance: Number(balance),
      color,
    });
    setSaving(false);
    if (error) {
      setFormError('Could not save the account. Please try again.');
      return;
    }
    setOpen(false);
    setName('');
    setBalance('');
    setType('checking');
    setColor('purple');
    onChanged();
  }

  async function handleDelete(id: string) {
    await supabase.from('accounts').delete().eq('id', id);
    onChanged();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-purple-500">
          {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} · your money at a glance
        </p>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={18} /> Add account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="card text-center py-12">
          <p className="font-display font-bold text-purple-900 mb-1">No accounts yet</p>
          <p className="text-sm text-purple-400 mb-4">Add your first account to start tracking your money.</p>
          <button className="btn-primary mx-auto" onClick={() => setOpen(true)}>
            <Plus size={18} /> Add account
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {accounts.map((a) => (
            <div key={a.id} className="relative group">
              <AccountCard account={a} />
              <button
                onClick={() => handleDelete(a.id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-purple-300 hover:text-orange-600 hover:bg-orange-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                aria-label={`Delete ${a.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} title="Add an account" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="field-label">Account name</label>
            <input className="field-input" placeholder="e.g. Main checking" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Type</label>
            <select className="field-input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="card">Credit card</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div>
            <label className="field-label">Starting balance</label>
            <input className="field-input" type="number" step="0.01" placeholder="0.00" value={balance} onChange={(e) => setBalance(e.target.value)} />
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
            {saving ? 'Saving…' : 'Add account'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
