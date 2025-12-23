import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Lightbulb } from 'lucide-react';
import { TCP_VARIANTS, TCPVariant } from '@/lib/tcpSimulation';

interface EducationalPanelProps {
  selectedVariant?: TCPVariant;
}

const EDUCATIONAL_CONTENT = {
  tahoe: {
    title: 'TCP Tahoe (1988)',
    algorithm: [
      'Slow Start: cwnd doubles every RTT until ssthresh',
      'Congestion Avoidance: cwnd += 1/cwnd per ACK (linear growth)',
      'On ANY loss: ssthresh = cwnd/2, cwnd = 1 MSS',
      'Always returns to slow start after loss'
    ],
    pros: ['Simple and robust', 'Works well with high loss rates', 'Conservative approach prevents network collapse'],
    cons: ['Poor performance in high-BDP networks', 'Full window reset is costly', 'Slow recovery from losses']
  },
  reno: {
    title: 'TCP Reno (1990)',
    algorithm: [
      'Same slow start and congestion avoidance as Tahoe',
      'Fast Retransmit: retransmit on 3 duplicate ACKs',
      'Fast Recovery: ssthresh = cwnd/2, cwnd = ssthresh + 3',
      'Exit fast recovery when new ACK arrives'
    ],
    pros: ['Faster recovery than Tahoe', 'Maintains higher throughput', 'Standard for many years'],
    cons: ['Struggles with multiple losses in one window', 'Still conservative in modern networks', 'Not optimized for high-BDP']
  },
  cubic: {
    title: 'TCP CUBIC (2008)',
    algorithm: [
      'Uses cubic function: W(t) = C(t-K)³ + Wmax',
      'K = ∛(Wmax × β / C) where β ≈ 0.7',
      'Window independent of RTT (RTT-fairness)',
      'Aggressive growth above Wmax, cautious below'
    ],
    pros: ['Excellent for high-BDP networks', 'RTT-independent fairness', 'Default in Linux since 2.6.19'],
    cons: ['Can be too aggressive in lossy networks', 'Complex parameter tuning', 'May not be fair to Reno flows']
  },
  adaptive: {
    title: 'Adaptive TCP (Novel)',
    algorithm: [
      'Monitors recent loss patterns continuously',
      'Adjusts aggressiveness factor (0.3 to 1.5)',
      'Higher losses → more conservative behavior',
      'Low loss period → increases aggressiveness'
    ],
    pros: ['Adapts to network conditions', 'Balances throughput and stability', 'Works across diverse scenarios'],
    cons: ['More complex state management', 'Requires tuning of adaptation rate', 'Novel - less real-world validation']
  }
};

export function EducationalPanel({ selectedVariant = 'tahoe' }: EducationalPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const content = EDUCATIONAL_CONTENT[selectedVariant];
  const variantInfo = TCP_VARIANTS.find(v => v.id === selectedVariant)!;

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="font-semibold">Algorithm Deep Dive</span>
          <span 
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: `${variantInfo.color}20`, color: variantInfo.color }}
          >
            {content.title}
          </span>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      
      {expanded && (
        <div className="p-6 pt-2 space-y-6 animate-fade-in">
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: variantInfo.color }} />
              Algorithm Steps
            </h4>
            <ol className="space-y-2">
              {content.algorithm.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="font-mono text-primary">{i + 1}.</span>
                  <span className="text-foreground/80">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-tcp-adaptive/10 border border-tcp-adaptive/30">
              <h5 className="text-sm font-semibold text-tcp-adaptive mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Advantages
              </h5>
              <ul className="space-y-1">
                {content.pros.map((pro, i) => (
                  <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                    <span className="text-tcp-adaptive">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <h5 className="text-sm font-semibold text-destructive mb-2">Limitations</h5>
              <ul className="space-y-1">
                {content.cons.map((con, i) => (
                  <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                    <span className="text-destructive">−</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
