import { NavLink } from 'react-router-dom';
import { PieChart, List, Tag, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/budget', label: 'Regra 50/30/20', icon: PieChart },
  { to: '/expenses', label: 'Despesas', icon: List },
  { to: '/categories', label: 'Categorias', icon: Tag },
];

export default function Sidebar() {
  return (
    <aside className="w-16 md:w-56 flex-shrink-0 flex flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <TrendingDown size={16} className="text-primary-foreground" />
          </div>
          <span className="hidden md:block font-bold text-lg text-foreground tracking-tight">
            FinTrack
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="hidden md:block">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border hidden md:block">
        <p className="text-xs text-muted-foreground">Seus dados são locais</p>
        <p className="text-xs text-muted-foreground">e privados 🔒</p>
      </div>
    </aside>
  );
}
