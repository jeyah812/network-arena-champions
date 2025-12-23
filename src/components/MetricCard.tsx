import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  color: 'tahoe' | 'reno' | 'cubic' | 'adaptive' | 'default';
  trend?: 'up' | 'down' | 'stable';
}

const colorClasses = {
  tahoe: 'text-tcp-tahoe border-tcp-tahoe/30 glow-tahoe',
  reno: 'text-tcp-reno border-tcp-reno/30 glow-reno',
  cubic: 'text-tcp-cubic border-tcp-cubic/30 glow-cubic',
  adaptive: 'text-tcp-adaptive border-tcp-adaptive/30 glow-adaptive',
  default: 'text-primary border-primary/30'
};

export function MetricCard({ title, value, unit, icon: Icon, color, trend }: MetricCardProps) {
  return (
    <div className={`metric-card ${colorClasses[color]} transition-all duration-300 hover:scale-[1.02]`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground font-medium">{title}</span>
          <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[0]}`} />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold font-mono">
            {typeof value === 'number' ? value.toFixed(2) : value}
          </span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            {trend === 'up' && <span className="text-tcp-adaptive">↑ Improving</span>}
            {trend === 'down' && <span className="text-destructive">↓ Declining</span>}
            {trend === 'stable' && <span className="text-muted-foreground">→ Stable</span>}
          </div>
        )}
      </div>
    </div>
  );
}
