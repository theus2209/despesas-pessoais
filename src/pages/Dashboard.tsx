import { useState, useMemo } from 'react';
import { Plus, TrendingDown, Hash, Repeat, Calendar } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import Header from '@/components/layout/Header';
import SummaryCard from '@/components/features/SummaryCard';
import CategoryChart from '@/components/features/CategoryChart';
import ExpenseItem from '@/components/features/ExpenseItem';
import ExpenseModal from '@/components/features/ExpenseModal';
import { formatCurrency } from '@/lib/storage';
import { Expense } from '@/types/expense';
import { toast } from 'sonner';

export default function Dashboard() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const { categories, handleAdd, handleUpdate, handleDelete, getByMonth } = useExpenses();

  const expenses = useMemo(() => getByMonth(year, month), [year, month, getByMonth, handleAdd, handleUpdate, handleDelete]);

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const recurring = useMemo(() => expenses.filter(e => e.type === 'recurring'), [expenses]);
  const totalRecurring = useMemo(() => recurring.reduce((s, e) => s + e.amount, 0), [recurring]);

  const byCategory = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    expenses.forEach(e => {
      if (!map[e.categoryId]) map[e.categoryId] = { total: 0, count: 0 };
      map[e.categoryId].total += e.amount;
      map[e.categoryId].count++;
    });
    return Object.entries(map)
      .map(([categoryId, v]) => ({ categoryId, ...v }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const topCategory = useMemo(() => {
    if (!byCategory.length) return null;
    const top = byCategory[0];
    return categories.find(c => c.id === top.categoryId);
  }, [byCategory, categories]);

  const handlePrev = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const handleNext = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const handleSave = (expense: Expense) => {
    if (editing) handleUpdate(expense);
    else handleAdd(expense);
    setEditing(null);
  };

  const handleEdit = (e: Expense) => { setEditing(e); setModalOpen(true); };
  const handleDel = (id: string) => {
    handleDelete(id);
    toast.success('Despesa removida');
  };

  const recent = expenses.slice(0, 5);

  return (
    <div className="min-h-screen">
      <Header
        title="Dashboard"
        year={year}
        month={month}
        onPrev={handlePrev}
        onNext={handleNext}
        action={
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nova Despesa</span>
          </button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total do Mês"
            value={formatCurrency(total)}
            sub={`${expenses.length} lançamento${expenses.length !== 1 ? 's' : ''}`}
            icon={TrendingDown}
            iconColor="text-destructive"
            highlight
          />
          <SummaryCard
            label="Recorrentes"
            value={formatCurrency(totalRecurring)}
            sub={`${recurring.length} despesa${recurring.length !== 1 ? 's' : ''} fixa${recurring.length !== 1 ? 's' : ''}`}
            icon={Repeat}
            iconColor="text-blue-400"
          />
          <SummaryCard
            label="Lançamentos"
            value={String(expenses.length)}
            sub="neste mês"
            icon={Hash}
            iconColor="text-primary"
          />
          <SummaryCard
            label="Maior Categoria"
            value={topCategory?.name ?? '—'}
            sub={topCategory ? `${topCategory.icon} maior gasto` : 'sem despesas'}
            icon={Calendar}
            iconColor="text-yellow-400"
          />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Gastos por Categoria</h2>
            <CategoryChart data={byCategory} categories={categories} />
          </div>

          {/* Recent expenses */}
          <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Últimos Lançamentos</h2>
              <a href="/expenses" className="text-xs text-primary hover:underline">Ver todos</a>
            </div>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm text-muted-foreground">Nenhuma despesa neste mês.</p>
                <button
                  onClick={() => { setEditing(null); setModalOpen(true); }}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  Adicionar primeira despesa
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map(e => (
                  <ExpenseItem
                    key={e.id}
                    expense={e}
                    categories={categories}
                    onEdit={handleEdit}
                    onDelete={handleDel}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ExpenseModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        categories={categories}
        expense={editing}
      />
    </div>
  );
}
