import { useState, useMemo } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import Header from '@/components/layout/Header';
import ExpenseItem from '@/components/features/ExpenseItem';
import ExpenseModal from '@/components/features/ExpenseModal';
import { Expense } from '@/types/expense';
import { formatCurrency } from '@/lib/storage';
import { toast } from 'sonner';

export default function ExpensesPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const { categories, handleAdd, handleUpdate, handleDelete, getByMonth } = useExpenses();

  const allExpenses = useMemo(
    () => getByMonth(year, month),
    [year, month, getByMonth]
  );

  const filtered = useMemo(() => {
    return allExpenses.filter(e => {
      const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'all' || e.categoryId === filterCat;
      const matchType = filterType === 'all' || e.type === filterType;
      return matchSearch && matchCat && matchType;
    });
  }, [allExpenses, search, filterCat, filterType]);

  const total = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);

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

  return (
    <div className="min-h-screen">
      <Header
        title="Despesas"
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

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar despesa..."
              className="w-full pl-9 pr-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
                className="pl-8 pr-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="all">Todas as categorias</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="all">Todos os tipos</option>
              <option value="manual">Manual</option>
              <option value="recurring">Recorrente</option>
            </select>
          </div>
        </div>

        {/* Summary bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl">
          <span className="text-sm text-muted-foreground">
            {filtered.length} de {allExpenses.length} despesa{allExpenses.length !== 1 ? 's' : ''}
          </span>
          <span className="text-sm font-semibold text-destructive">
            Total: {formatCurrency(total)}
          </span>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-base font-medium text-foreground">Nenhuma despesa encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              {allExpenses.length === 0 ? 'Adicione sua primeira despesa!' : 'Tente ajustar os filtros.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(e => (
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

      <ExpenseModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        categories={categories}
        expense={editing}
        defaultDate={`${year}-${String(month + 1).padStart(2, '0')}-15`}
      />
    </div>
  );
}
