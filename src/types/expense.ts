export type ExpenseType = 'manual' | 'recurring';
export type CategoryGroup = 'needs' | 'wants' | 'financial' | 'other';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
  group?: CategoryGroup;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  date: string; // ISO string
  type: ExpenseType;
  recurringDay?: number; // day of month for recurring
  notes?: string;
  createdAt: string;
}

export interface MonthSummary {
  total: number;
  byCategory: { categoryId: string; total: number; count: number }[];
  count: number;
}
