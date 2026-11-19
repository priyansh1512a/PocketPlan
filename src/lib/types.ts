export type Accent = 'purple' | 'mint' | 'orange';

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: Accent;
  created_at: string;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  color: Accent;
  created_at: string;
}

export interface Budget {
  id: string;
  category: string;
  limit_amount: number;
  color: Accent;
  created_at: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  account_id: string | null;
  date: string;
  created_at: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  due_day: number;
  category: string;
  is_paid: boolean;
  paid_month: string | null;
  created_at: string;
}
