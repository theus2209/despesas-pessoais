import { useState, useEffect } from 'react';
import { X, ShieldCheck, Smile, TrendingUp, CircleDashed } from 'lucide-react';
import { Category, CategoryGroup } from '@/types/expense';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CategoryEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  category: Category | null;
}

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#84cc16', '#64748b', '#94a3b8',
];

const PRESET_ICONS = [
  '🏠','🚗','🍽️','💊','🎮','📺','👕','✈️',
  '📚','📈','🧾','💰','🐾','🎵','🏋️','🛒',
  '⚡','💻','🎁','🏥','🍕','☕','🎓','🔧',
];

interface GroupOption {
  key: CategoryGroup;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}

const GROUP_OPTIONS: GroupOption[] = [
  {
    key: 'needs',
    label: 'Necessidades',
    subtitle: '50%',
    icon: ShieldCheck,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
  },
  {
    key: 'wants',
    label: 'Desejos',
    subtitle: '30%',
    icon: Smile,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/40',
  },
  {
    key: 'financial',
    label: 'Financeiro',
    subtitle: '20%',
    icon: TrendingUp,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/40',
  },
  {
    key: 'other',
    label: 'Não classificado',
    subtitle: '—',
    icon: CircleDashed,
    color: 'text-muted-foreground',
    bg: 'bg-muted/30',
    border: 'border-border',
  },
];

export default function CategoryEditModal({
  open,
  onClose,
  onSave,
  category,
}: CategoryEditModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💰');
  const [color, setColor] = useState('#6366f1');
  const [group, setGroup] = useState<CategoryGroup>('other');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
      setColor(category.color);
      setGroup(category.group ?? 'other');
    }
  }, [category, open]);

  if (!open || !category) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Informe o nome da categoria'); return; }
    onSave({ ...category, name: name.trim(), icon, color, group });
    toast.success('Categoria atualizada!');
    onClose();
  };

  const isDefault = !category.isCustom;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-base font-semibold text-foreground">Editar Categoria</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Preview */}
          <div className="flex items-center justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: color + '33' }}
            >
              {icon}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isDefault}
              placeholder="Nome da categoria"
              className={cn(
                'w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors',
                isDefault && 'opacity-60 cursor-not-allowed'
              )}
            />
            {isDefault && (
              <p className="text-xs text-muted-foreground mt-1">Nome das categorias padrão não pode ser alterado.</p>
            )}
          </div>

          {/* Icon (only for custom) */}
          {!isDefault && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Ícone</label>
              <div className="grid grid-cols-8 gap-1.5">
                {PRESET_ICONS.map(em => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    className={cn(
                      'w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors',
                      icon === em ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-accent'
                    )}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color (only for custom) */}
          {!isDefault && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Cor</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      'w-7 h-7 rounded-full transition-transform',
                      color === c ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Group classification */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Grupo na Regra 50/30/20
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Define em qual grupo esta categoria será contabilizada.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {GROUP_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setGroup(opt.key)}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all',
                    group === opt.key
                      ? cn(opt.bg, opt.border, 'ring-1', opt.border.replace('border-', 'ring-'))
                      : 'border-border bg-secondary hover:border-border/60'
                  )}
                >
                  <opt.icon
                    size={16}
                    className={cn(group === opt.key ? opt.color : 'text-muted-foreground')}
                  />
                  <div>
                    <p className={cn('text-xs font-semibold', group === opt.key ? opt.color : 'text-foreground')}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{opt.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

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
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
