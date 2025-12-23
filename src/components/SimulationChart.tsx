import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { SimulationResult, TCP_VARIANTS, TCPVariant } from '@/lib/tcpSimulation';

interface SimulationChartProps {
  results: SimulationResult[];
  activeVariants: Set<TCPVariant>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-border/50">
        <p className="font-mono text-sm text-muted-foreground mb-2">Time: {label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-mono text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value?.toFixed(2)} MSS
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SimulationChart({ results, activeVariants }: SimulationChartProps) {
  const chartData = useMemo(() => {
    if (results.length === 0) return [];
    
    const maxLength = Math.max(...results.map(r => r.data.length));
    const data: any[] = [];
    
    for (let i = 0; i < maxLength; i++) {
      const point: any = { time: i };
      results.forEach(r => {
        if (r.data[i]) {
          point[r.variant] = r.data[i].cwnd;
          point[`${r.variant}_event`] = r.data[i].event;
        }
      });
      data.push(point);
    }
    
    return data;
  }, [results]);

  const variantColors = useMemo(() => {
    const colors: Record<string, string> = {};
    TCP_VARIANTS.forEach(v => {
      colors[v.id] = v.color;
    });
    return colors;
  }, []);

  return (
    <div className="w-full h-[400px] glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
        Congestion Window Evolution
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            fontFamily="var(--font-mono)"
            label={{ value: 'Time (RTT)', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            fontFamily="var(--font-mono)"
            label={{ value: 'cwnd (MSS)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
          />
          <ReferenceLine y={32} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label={{ value: 'ssthresh', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
          
          {TCP_VARIANTS.map(variant => (
            activeVariants.has(variant.id) && (
              <Line
                key={variant.id}
                type="monotone"
                dataKey={variant.id}
                name={variant.name}
                stroke={variantColors[variant.id]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
