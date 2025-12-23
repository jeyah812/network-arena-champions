import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { SimulationResult, TCP_VARIANTS, TCPVariant } from '@/lib/tcpSimulation';

interface ThroughputChartProps {
  results: SimulationResult[];
  winner: TCPVariant | null;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 border border-border/50">
        <p className="font-semibold mb-1" style={{ color: data.color }}>{data.name}</p>
        <p className="font-mono text-sm text-muted-foreground">
          Throughput: {data.throughput.toFixed(2)} MSS/RTT
        </p>
      </div>
    );
  }
  return null;
};

export function ThroughputChart({ results, winner }: ThroughputChartProps) {
  const chartData = results.map(r => {
    const variantInfo = TCP_VARIANTS.find(v => v.id === r.variant)!;
    return {
      name: variantInfo.name,
      throughput: r.throughput,
      color: variantInfo.color,
      variant: r.variant,
      isWinner: r.variant === winner
    };
  });

  return (
    <div className="w-full h-[300px] glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-tcp-reno animate-pulse-glow" />
        Throughput Comparison
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            fontFamily="var(--font-mono)"
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            fontFamily="var(--font-mono)"
            label={{ value: 'MSS/RTT', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="throughput" 
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                opacity={entry.isWinner ? 1 : 0.6}
                stroke={entry.isWinner ? entry.color : 'transparent'}
                strokeWidth={entry.isWinner ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
