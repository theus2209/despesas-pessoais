import { Pencil, Trash2, Repeat } from 'lucide-react';
import { Expense, Category } from '@/types/expense';
import { formatCurrency } from '@/lib/storage';

interface ExpenseItemProps {
  expense: Expense;
  categories: Category[];
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseItem({ expense, categories, onEdit, onDelete }: ExpenseItemProps) {
  const cat = categories.find(c => c.id === expense.categoryId);
  const dateLabel = new Date(expense.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-border/60 transition-colors group">
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: (cat?.color ?? '#94a3b8') + '22' }}
      >
        {cat?.icon ?? '💰'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{expense.description}</p>
          {expense.type === 'recurring' && (
            <Repeat size={12} className="text-muted-foreground flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-xs px-1.5 py-0.5 rounded-md"
            style={{
              backgroundColor: (cat?.color ?? '#94a3b8') + '22',
              color: cat?.color ?? '#94a3b8',
            }}
          >
            {cat?.name ?? 'Outros'}
          </span>
          <span className="text-xs text-muted-foreground">{dateLabel}</span>
          {expense.notes && (
            <span className="text-xs text-muted-foreground truncate">{expense.notes}</span>
          )}
        </div>
      </div>

      {/* Amount */}
      <p className="text-sm font-semibold text-destructive flex-shrink-0">
        − {formatCurrency(expense.amount)}
      </p>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(expense)}
          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Editar"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(expense.id)}
          className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Excluir"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
