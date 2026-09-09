import { useEffect, useState } from 'react';
import { X, Repeat, PenLine } from 'lucide-react';
import { Expense, Category, ExpenseType } from '@/types/expense';
import { generateId } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  categories: Category[];
  expense?: Expense | null;
  defaultDate?: string; // YYYY-MM-DD, used when creating new expenses
}

const todayStr = () => new Date().toISOString().split('T')[0];

export default function ExpenseModal({
  open,
  onClose,
  onSave,
  categories,
  expense,
  defaultDate,
}: ExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(todayStr());
  const [type, setType] = useState<ExpenseType>('manual');
  const [recurringDay, setRecurringDay] = useState('1');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(String(expense.amount));
      setCategoryId(expense.categoryId);
      setDate(expense.date.split('T')[0]);
      setType(expense.type);
      setRecurringDay(String(expense.recurringDay ?? 1));
      setNotes(expense.notes ?? '');
    } else {
      setDescription('');
      setAmount('');
      setCategoryId(categories[0]?.id ?? '');
      setDate(defaultDate ?? todayStr());
      setType('manual');
      setRecurringDay('1');
      setNotes('');
    }
  }, [expense, open, categories]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!description.trim()) { toast.error('Informe a descrição'); return; }
    if (isNaN(parsedAmount) || parsedAmount <= 0) { toast.error('Valor inválido'); return; }
    if (!categoryId) { toast.error('Selecione uma categoria'); return; }

    const saved: Expense = {
      id: expense?.id ?? generateId(),
      description: description.trim(),
      amount: parsedAmount,
      categoryId,
      date: new Date(date + 'T12:00:00').toISOString(),
      type,
      recurringDay: type === 'recurring' ? parseInt(recurringDay) : undefined,
      notes: notes.trim() || undefined,
      createdAt: expense?.createdAt ?? new Date().toISOString(),
    };
    onSave(saved);
    toast.success(expense ? 'Despesa atualizada!' : 'Despesa adicionada!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {expense ? 'Editar Despesa' : 'Nova Despesa'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2 p-1 bg-secondary rounded-lg">
            {([['manual', 'Manual', PenLine], ['recurring', 'Recorrente', Repeat]] as const).map(
              ([val, label, Icon]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setType(val)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors',
                    type === val
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon size={14} />
                  {label}
                </button>
              )
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Conta de luz"
              className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Amount + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date or Recurring Day */}
          {type === 'manual' ? (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Data</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Dia de vencimento (todo mês)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={recurringDay}
                onChange={e => setRecurringDay(e.target.value)}
                className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              Observações (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Detalhes adicionais..."
              className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary rounded-lg text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {expense ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
