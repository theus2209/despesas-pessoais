import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Category } from '@/types/expense';
import { formatCurrency } from '@/lib/storage';

interface CategoryChartProps {
  data: { categoryId: string; total: number; count: number }[];
  categories: Category[];
}

const RADIAN = Math.PI / 180;

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function CategoryChart({ data, categories }: CategoryChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Nenhuma despesa neste mês
      </div>
    );
  }

  const chartData = data.map(d => {
    const cat = categories.find(c => c.id === d.categoryId);
    return {
      name: cat?.name ?? 'Outros',
      value: d.total,
      color: cat?.color ?? '#94a3b8',
      icon: cat?.icon ?? '💰',
    };
  });

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Total']}
            contentStyle={{
              backgroundColor: 'hsl(222 47% 11%)',
              border: '1px solid hsl(216 34% 17%)',
              borderRadius: '8px',
              color: 'hsl(213 31% 91%)',
              fontSize: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-2 space-y-2">
        {chartData.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <span className="text-muted-foreground">{item.icon} {item.name}</span>
            </div>
            <span className="font-medium text-foreground">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
