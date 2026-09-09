import { Category, Expense } from '@/types/expense';

export const DEFAULT_CATEGORIES: Category[] = [
  // Necessidades
  { id: 'housing', name: 'Moradia', icon: '🏠', color: '#6366f1', group: 'needs' },
  { id: 'transport', name: 'Transporte', icon: '🚗', color: '#f59e0b', group: 'needs' },
  { id: 'food', name: 'Alimentação', icon: '🍽️', color: '#10b981', group: 'needs' },
  { id: 'health', name: 'Saúde', icon: '💊', color: '#ef4444', group: 'needs' },
  { id: 'taxes', name: 'Impostos', icon: '🧾', color: '#64748b', group: 'needs' },
  // Desejos
  { id: 'leisure', name: 'Lazer', icon: '🎮', color: '#8b5cf6', group: 'wants' },
  { id: 'subscriptions', name: 'Assinaturas', icon: '📺', color: '#3b82f6', group: 'wants' },
  { id: 'clothing', name: 'Roupas', icon: '👕', color: '#ec4899', group: 'wants' },
  { id: 'travel', name: 'Viagem', icon: '✈️', color: '#06b6d4', group: 'wants' },
  // Financeiro
  { id: 'education', name: 'Educação', icon: '📚', color: '#f97316', group: 'financial' },
  { id: 'investments', name: 'Investimentos', icon: '📈', color: '#84cc16', group: 'financial' },
  // Outros
  { id: 'other', name: 'Outros', icon: '💰', color: '#94a3b8', group: 'other' },
];

const CATEGORIES_KEY = 'fintrack_categories';
const EXPENSES_KEY = 'fintrack_expenses';

export function getCategories(): Category[] {
  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (!stored) return DEFAULT_CATEGORIES;
  try {
    const parsed: Category[] = JSON.parse(stored);
    // Migrate: ensure default categories always have their group
    return parsed.map(c => {
      const def = DEFAULT_CATEGORIES.find(d => d.id === c.id);
      if (def && !c.group) return { ...c, group: def.group };
      return c;
    });
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function getExpenses(): Expense[] {
  const stored = localStorage.getItem(EXPENSES_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

export function addExpense(expense: Expense): void {
  const expenses = getExpenses();
  expenses.unshift(expense);
  saveExpenses(expenses);
}

export function updateExpense(updated: Expense): void {
  const expenses = getExpenses();
  const idx = expenses.findIndex(e => e.id === updated.id);
  if (idx !== -1) {
    expenses[idx] = updated;
    saveExpenses(expenses);
  }
}

export function deleteExpense(id: string): void {
  const expenses = getExpenses();
  saveExpenses(expenses.filter(e => e.id !== id));
}

export function getExpensesByMonth(year: number, month: number): Expense[] {
  const expenses = getExpenses();
  return expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
}
