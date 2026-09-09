import { useState } from 'react';
import { X } from 'lucide-react';
import { Category } from '@/types/expense';
import { generateId } from '@/lib/storage';
import { toast } from 'sonner';

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
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

export default function CategoryModal({ open, onClose, onSave }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💰');
  const [color, setColor] = useState('#6366f1');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Informe o nome da categoria'); return; }
    onSave({ id: generateId(), name: name.trim(), icon, color, isCustom: true });
    toast.success('Categoria criada!');
    setName(''); setIcon('💰'); setColor('#6366f1');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Nova Categoria</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Preview */}
          <div className="flex items-center justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: color + '33' }}
            >
              {icon}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Pet Shop"
              className="w-full px-3 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Ícone</label>
            <div className="grid grid-cols-8 gap-1.5">
              {PRESET_ICONS.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors ${icon === em ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-accent'}`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Cor</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-primary rounded-lg text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
