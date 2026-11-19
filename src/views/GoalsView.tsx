import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/format';
import type { Goal, Accent } from '@/lib/types';
import { Plus, Trash2, Target } from 'lucide-react';

interface GoalsProps {
  goals: Goal[];
  onChanged: () => void;
}

const accents: { value: Accent; label: string; swatch: string; bar: string }[] = [
  { value: 'purple', label: 'Purple', swatch: 'bg-purple-500', bar: 'bg-purple-500' },
  { value: 'mint', label: 'Mint', swatch: 'bg-mint-500', bar: 'bg-mint-500' },
  { value: 'orange', label: 'Orange', swatch: 'bg-orange-500', bar: 'bg-orange-500' },
];

export function GoalsView({ goals, onChanged }: GoalsProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState<Accent>('mint');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleAdd() {
    if (!name.trim() || !target || Number(target) <= 0) {
      setFormError('Please enter a goal name and a target amount greater than zero.');
      return;
    }
    setSaving(true);
    setFormError(null);
    const { error } = await supabase.from('goals').insert({
      name: name.trim(),
      target_amount: Number(target),
      target_date: targetDate || null,
      color,
    });
    setSaving(false);
    if (error) {
      setFormError('Could not save the goal. Please try again.');
      return;
    }
    setOpen(false);
    setName('');
    setTarget('');
    setTargetDate('');
    setColor('mint');
    onChanged();
  }

  async function addToGoal(goal: Goal) {
    const input = prompt(`Add amount to "${goal.name}"`);
    if (input === null) return;
    const value = Number(input);
    if (!input.trim() || Number.isNaN(value) || value <= 0) return;
    const next = Math.min(Number(goal.target_amount), Number(goal.saved_amount) + value);
    await supabase.from('goals').update({ saved_amount: next }).eq('id', goal.id);
    onChanged();
  }

  async function handleDelete(id: string) {
    await supabase.from('goals').delete().eq('id', id);
    onChanged();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-purple-500">Save toward what matters to you</p>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={18} /> New goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card text-center py-12">
          <Target className="mx-auto text-purple-300 mb-3" size={40} />
          <p className="font-display font-bold text-purple-900 mb-1">No goals yet</p>
          <p className="text-sm text-purple-400 mb-4">Set a savings goal — a trip, an emergency fund, anything.</p>
          <button className="btn-primary mx-auto" onClick={() => setOpen(true)}>
            <Plus size={18} /> New goal
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((g) => {
            const saved = Number(g.saved_amount);
            const targetAmt = Number(g.target_amount);
            const pct = targetAmt > 0 ? Math.min(100, (saved / targetAmt) * 100) : 0;
            const done = saved >= targetAmt;
            const accent = accents.find((a) => a.value === g.color) ?? accents[0];
            return (
              <div key={g.id} className="card group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-purple-900">{g.name}</p>
                    <p className="text-xs text-purple-400">
                      {g.target_date ? `Target date ${new Date(g.target_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'No target date'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1.5 rounded-lg text-purple-300 hover:text-orange-600 hover:bg-orange-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                    aria-label={`Delete ${g.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="h-3 rounded-full bg-purple-100 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-mint-500' : accent.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-bold text-purple-900">{formatCurrency(saved)}</span>
                    <span className="text-purple-400"> of {formatCurrency(targetAmt)}</span>
                  </p>
                  <p className={`text-xs font-bold ${done ? 'text-mint-600' : 'text-purple-400'}`}>
                    {done ? 'Goal reached!' : `${Math.round(pct)}%`}
                  </p>
                </div>
                {!done && (
                  <button onClick={() => addToGoal(g)} className="btn-secondary w-full justify-center mt-4 text-purple-700">
                    <Plus size={16} /> Add to savings
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} title="Create a savings goal" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="field-label">Goal name</label>
            <input className="field-input" placeholder="e.g. Vacation fund" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Target amount</label>
              <input className="field-input" type="number" step="0.01" min="0" placeholder="0.00" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Target date (optional)</label>
              <input className="field-input" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
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
            {saving ? 'Saving…' : 'Create goal'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
