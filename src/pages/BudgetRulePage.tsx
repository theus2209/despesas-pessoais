
import { useState, useMemo } from 'react';
import { Plus, DollarSign, ShieldCheck, Smile, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import Header from '@/components/layout/Header';
import ExpenseModal from '@/components/features/ExpenseModal';
import { formatCurrency } from '@/lib/storage';
import { Expense, Category, CategoryGroup } from '@/types/expense';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type BucketKey = CategoryGroup;

function getBucket(categoryId: string, categories: Category[]): BucketKey {
  const cat = categories.find(c => c.id === categoryId);
  return cat?.group ?? 'other';
}

interface BucketConfig {
  key: BucketKey;
  label: string;
  subtitle: string;
  percent: number;
  icon: React.ElementType;
  color: string;
  barColor: string;
  bgColor: string;
  borderColor: string;
}

const BUCKETS: BucketConfig[] = [
  {
    key: 'needs',
    label: 'Necessidades',
    subtitle: '50% da renda',
    percent: 0.5,
    icon: ShieldCheck,
    color: 'text-blue-400',
    barColor: 'bg-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    key: 'wants',
    label: 'Desejos',
    subtitle: '30% da renda',
    percent: 0.3,
    icon: Smile,
    color: 'text-purple-400',
    barColor: 'bg-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  {
    key: 'financial',
    label: 'Financeiro',
    subtitle: '20% da renda',
    percent: 0.2,
    icon: TrendingUp,
    color: 'text-green-400',
    barColor: 'bg-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
];

const INCOME_KEY = 'fintrack_income';

function getStoredIncome(): string {
  return localStorage.getItem(INCOME_KEY) ?? '';
}
function setStoredIncome(v: string) {
  localStorage.setItem(INCOME_KEY, v);
}

export default function BudgetRulePage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [incomeInput, setIncomeInput] = useState(getStoredIncome);
  const [expanded, setExpanded] = useState<BucketKey | null>(null);

  const { categories, handleAdd, handleUpdate, handleDelete, getByMonth } = useExpenses();

  const expenses = useMemo(
    () => getByMonth(year, month),
    [year, month, getByMonth]
  );

  const income = useMemo(() => {
    const parsed = parseFloat(incomeInput.replace(',', '.'));
    return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
  }, [incomeInput]);

  // Agrupar despesas por bucket
  const bucketTotals = useMemo(() => {
    const totals: Record<BucketKey, number> = { needs: 0, wants: 0, financial: 0, other: 0 };
    const items: Record<BucketKey, Expense[]> = { needs: [], wants: [], financial: [], other: [] };
    expenses.forEach(e => {
      const bucket = getBucket(e.categoryId, categories);
      totals[bucket] += e.amount;
      items[bucket].push(e);
    });
    return { totals, items };
  }, [expenses, categories]);

  const totalSpent = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses]
  );

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

  const handleDel = (id: string) => {
    handleDelete(id);
    toast.success('Despesa removida');
  };

  const handleIncomeChange = (v: string) => {
    setIncomeInput(v);
    setStoredIncome(v);
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Regra 50/30/20"
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

      <div className="p-6 space-y-6 max-w-3xl mx-auto">

        {/* Income input */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <DollarSign size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Renda Mensal Líquida</p>
              <p className="text-xs text-muted-foreground">Base para calcular os limites da regra</p>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">R$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={incomeInput}
              onChange={e => handleIncomeChange(e.target.value)}
              placeholder="0,00"
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-base font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
            />
          </div>
          {income > 0 && (
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Total gasto no mês: <span className="text-destructive font-semibold">{formatCurrency(totalSpent)}</span></span>
              <span>Saldo disponível: <span className={cn('font-semibold', income - totalSpent >= 0 ? 'text-primary' : 'text-destructive')}>{formatCurrency(income - totalSpent)}</span></span>
            </div>
          )}
        </div>

        {income === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-card border border-dashed border-border rounded-xl">
            <div className="text-4xl mb-3">💡</div>
            <p className="text-sm font-medium text-foreground">Informe sua renda para ver a análise</p>
            <p className="text-xs text-muted-foreground mt-1">A regra 50/30/20 vai distribuir seus limites automaticamente.</p>
          </div>
        )}

        {income > 0 && (
          <div className="space-y-4">
            {BUCKETS.map(bucket => {
              const limit = income * bucket.percent;
              const spent = bucketTotals.totals[bucket.key];
              const progress = Math.min((spent / limit) * 100, 100);
              const over = spent > limit;
              const remaining = limit - spent;
              const isExpanded = expanded === bucket.key;
              const bucketExpenses = bucketTotals.items[bucket.key];

              return (
                <div
                  key={bucket.key}
                  className={cn(
                    'rounded-xl border transition-colors overflow-hidden',
                    bucket.bgColor,
                    bucket.borderColor
                  )}
                >
                  {/* Header row */}
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : bucket.key)}
                    className="w-full flex items-center gap-4 p-5 text-left"
                  >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bucket.bgColor, 'border', bucket.borderColor)}>
                      <bucket.icon size={18} className={bucket.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-sm font-semibold text-foreground">{bucket.label}</span>
                          <span className={cn('ml-2 text-xs font-medium', bucket.color)}>{bucket.subtitle}</span>
                        </div>
                        <div className="text-right">
                          <span className={cn('text-base font-bold', over ? 'text-destructive' : 'text-foreground')}>
                            {formatCurrency(spent)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">/ {formatCurrency(limit)}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            over ? 'bg-destructive' : bucket.barColor
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {bucketExpenses.length} lançamento{bucketExpenses.length !== 1 ? 's' : ''}
                        </span>
                        <span className={cn('text-xs font-medium', over ? 'text-destructive' : 'text-muted-foreground')}>
                          {over
                            ? `⚠ Excedeu ${formatCurrency(Math.abs(remaining))}`
                            : remaining > 0
                            ? `Restam ${formatCurrency(remaining)}`
                            : 'Limite atingido'}
                        </span>
                      </div>
                    </div>

                    <div className="ml-2 text-muted-foreground">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {/* Expanded list */}
                  {isExpanded && (
                    <div className="border-t border-border/40 px-5 pb-4 pt-3 space-y-2">
                      {bucketExpenses.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Nenhum gasto nesta categoria neste mês.
                        </p>
                      ) : (
                        bucketExpenses.map(e => {
                          const cat = categories.find(c => c.id === e.categoryId);
                          return (
                            <div key={e.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                                style={{ backgroundColor: (cat?.color ?? '#94a3b8') + '22' }}
                              >
                                {cat?.icon ?? '💰'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground font-medium truncate">{e.description}</p>
                                <p className="text-xs text-muted-foreground">{cat?.name ?? 'Outros'} · {new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-destructive">− {formatCurrency(e.amount)}</span>
                                <button
                                  onClick={(ev) => { ev.stopPropagation(); handleDel(e.id); }}
                                  className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                                  aria-label="Excluir"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Não classificados */}
            {bucketTotals.totals.other > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Não classificados</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{bucketTotals.items.other.length} despesas sem grupo definido</p>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{formatCurrency(bucketTotals.totals.other)}</span>
                </div>
              </div>
            )}

            {/* Resumo geral */}
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Resumo do Mês</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {BUCKETS.map(b => {
                  const limit = income * b.percent;
                  const spent = bucketTotals.totals[b.key];
                  const over = spent > limit;
                  return (
                    <div key={b.key} className={cn('rounded-lg p-3', b.bgColor, 'border', b.borderColor)}>
                      <p className={cn('text-xs font-medium mb-1', b.color)}>{b.label}</p>
                      <p className={cn('text-sm font-bold', over ? 'text-destructive' : 'text-foreground')}>
                        {Math.round((spent / limit) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">usado</p>
                    </div>
                  );
                })}
              </div>
            </div>
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
