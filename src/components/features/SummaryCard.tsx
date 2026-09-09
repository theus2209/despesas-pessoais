import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
}

export default function SummaryCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor = 'text-primary',
  highlight,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-5 border transition-colors',
        highlight
          ? 'bg-primary/10 border-primary/30'
          : 'bg-card border-border hover:border-border/80'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <div className={cn('p-2 rounded-lg bg-card', highlight && 'bg-primary/20')}>
          <Icon size={16} className={iconColor} />
        </div>
      </div>
      <p className={cn('text-2xl font-bold', highlight ? 'text-primary' : 'text-foreground')}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
