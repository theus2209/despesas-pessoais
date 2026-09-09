import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthLabel } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  action?: React.ReactNode;
}

export default function Header({ title, year, month, onPrev, onNext, action }: HeaderProps) {
  const isCurrentMonth =
    new Date().getFullYear() === year && new Date().getMonth() === month;

  return (
    <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Mês anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className={cn(
              'text-sm font-medium px-2 capitalize',
              isCurrentMonth ? 'text-primary' : 'text-foreground'
            )}
          >
            {getMonthLabel(year, month)}
          </span>
          <button
            onClick={onNext}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Próximo mês"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
