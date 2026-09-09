import { useState, useMemo } from 'react';
import { Plus, Trash2, Lock, Pencil, ShieldCheck, Smile, TrendingUp } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import CategoryModal from '@/components/features/CategoryModal';
import CategoryEditModal from '@/components/features/CategoryEditModal';
import { Category, CategoryGroup } from '@/types/expense';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const GROUP_META: Record<CategoryGroup, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  needs: { label: 'Necessidades', icon: ShieldCheck, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  wants: { label: 'Desejos', icon: Smile, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  financial: { label: 'Financeiro', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  other: { label: 'Não classificado', icon: () => null, color: 'text-muted-foreground', bg: 'bg-muted/20', border: 'border-border' },
};

export default function CategoriesPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const { categories, expenses, handleAddCategory, handleUpdateCategory, handleDeleteCategory } = useExpenses();

  const expenseCountByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => {
      map[e.categoryId] = (map[e.categoryId] ?? 0) + 1;
    });
    return map;
  }, [expenses]);

  const handleDelete = (cat: Category) => {
    if (!cat.isCustom) {
      toast.error('Categorias padrão não podem ser removidas');
      return;
    }
    const count = expenseCountByCategory[cat.id] ?? 0;
    if (count > 0) {
      toast.warning(`Existem ${count} despesa${count !== 1 ? 's' : ''} nesta categoria. Serão movidas para "Outros".`);
    }
    handleDeleteCategory(cat.id);
    toast.success(`Categoria "${cat.name}" removida`);
  };

  // Group categories by their group
  const grouped = useMemo(() => {
    const map: Record<CategoryGroup, Category[]> = { needs: [], wants: [], financial: [], other: [] };
    categories.forEach(c => {
      const g = c.group ?? 'other';
      map[g].push(c);
    });
    return map;
  }, [categories]);

  const groupOrder: CategoryGroup[] = ['needs', 'wants', 'financial', 'other'];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-foreground">Categorias</h1>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nova Categoria</span>
        </button>
      </div>

      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <p className="text-sm text-muted-foreground">
          Clique em <span className="text-foreground font-medium">editar</span> para alterar o grupo de cada categoria na Regra 50/30/20.
        </p>

        {groupOrder.map(groupKey => {
          const cats = grouped[groupKey];
          if (cats.length === 0) return null;
          const meta = GROUP_META[groupKey];
          const MetaIcon = meta.icon;

          return (
            <section key={groupKey}>
              <div className={cn('flex items-center gap-2 mb-3 px-3 py-2 rounded-lg border w-fit', meta.bg, meta.border)}>
                <MetaIcon size={14} className={meta.color} />
                <h2 className={cn('text-xs font-semibold', meta.color)}>{meta.label}</h2>
                <span className="text-xs text-muted-foreground ml-1">· {cats.length} categorias</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cats.map(cat => (
                  <CategoryCard
                    key={cat.id}
                    cat={cat}
                    count={expenseCountByCategory[cat.id] ?? 0}
                    onEdit={() => setEditingCat(cat)}
                    onDelete={() => handleDelete(cat)}
                    canDelete={!!cat.isCustom}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <CategoryModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleAddCategory}
      />

      <CategoryEditModal
        open={editingCat !== null}
        onClose={() => setEditingCat(null)}
        onSave={cat => { handleUpdateCategory(cat); setEditingCat(null); }}
        category={editingCat}
      />
    </div>
  );
}

function CategoryCard({
  cat,
  count,
  onEdit,
  onDelete,
  canDelete,
}: {
  cat: Category;
  count: number;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-border/60 transition-colors group">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ backgroundColor: cat.color + '22' }}
      >
        {cat.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{cat.name}</p>
        <p className="text-xs text-muted-foreground">
          {count > 0 ? `${count} despesa${count !== 1 ? 's' : ''}` : 'Sem despesas'}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Editar"
        >
          <Pencil size={13} />
        </button>
        {canDelete ? (
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remover"
          >
            <Trash2 size={13} />
          </button>
        ) : (
          <Lock size={12} className="text-muted-foreground/40 mx-1.5" />
        )}
      </div>

      <div
        className="w-2 h-2 rounded-full flex-shrink-0 group-hover:hidden"
        style={{ backgroundColor: cat.color }}
      />
    </div>
  );
}
