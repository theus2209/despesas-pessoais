import { useState, useEffect, useCallback } from 'react';
import { Expense, Category } from '@/types/expense';
import {
  getExpenses,
  getCategories,
  saveCategories,
  addExpense,
  updateExpense,
  deleteExpense,
  saveExpenses,
  getExpensesByMonth,
  DEFAULT_CATEGORIES,
} from '@/lib/storage';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const reload = useCallback(() => {
    setExpenses(getExpenses());
    setCategories(getCategories());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleAdd = useCallback((expense: Expense) => {
    addExpense(expense);
    setExpenses(getExpenses());
  }, []);

  const handleUpdate = useCallback((expense: Expense) => {
    updateExpense(expense);
    setExpenses(getExpenses());
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteExpense(id);
    setExpenses(getExpenses());
  }, []);

  const handleUpdateCategory = useCallback((updated: Category) => {
    const current = getCategories();
    const idx = current.findIndex(c => c.id === updated.id);
    if (idx !== -1) {
      current[idx] = updated;
      saveCategories(current);
      setCategories([...current]);
    }
  }, []);

  const handleAddCategory = useCallback((cat: Category) => {
    const updated = [...getCategories(), cat];
    saveCategories(updated);
    setCategories(updated);
  }, []);

  const handleDeleteCategory = useCallback((id: string) => {
    const updated = getCategories().filter(c => c.id !== id);
    saveCategories(updated);
    setCategories(updated);
    // Remove expenses in this category
    const expensesUpdated = getExpenses().map(e =>
      e.categoryId === id ? { ...e, categoryId: 'other' } : e
    );
    saveExpenses(expensesUpdated);
    setExpenses(expensesUpdated);
  }, []);

  const getByMonth = useCallback(
    (year: number, month: number) => expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }),
    [expenses]
  );

  return {
    expenses,
    categories,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    getByMonth,
    reload,
  };
}
