import { formatCurrency, accentClasses } from '@/lib/format';
import { Wallet, PiggyBank, CreditCard, Banknote, Building2 } from 'lucide-react';
import type { Account } from '@/lib/types';

const typeIcons: Record<string, typeof Wallet> = {
  checking: Building2,
  savings: PiggyBank,
  card: CreditCard,
  cash: Banknote,
};

export function AccountCard({ account }: { account: Account }) {
  const accent = accentClasses(account.color);
  const Icon = typeIcons[account.type] ?? Wallet;
  return (
    <div className={`card flex items-center gap-4 ring-1 ${accent.ring} hover:shadow-lift transition-shadow duration-200`}>
      <div className={`w-11 h-11 rounded-xl ${accent.bg} ${accent.text} flex items-center justify-center shrink-0`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-purple-800 truncate">{account.name}</p>
        <p className="text-sm text-purple-300 capitalize">{account.type}</p>
      </div>
      <p className={`font-display font-bold text-lg ${account.balance < 0 ? 'text-orange-500' : accent.text}`}>
        {formatCurrency(account.balance)}
      </p>
    </div>
  );
}
