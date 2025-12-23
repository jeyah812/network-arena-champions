import { Trophy, TrendingUp, Scale, Activity } from 'lucide-react';
import { TCPVariant, TCP_VARIANTS } from '@/lib/tcpSimulation';

interface WinnerAnnouncementProps {
  winner: TCPVariant;
  scores: Record<TCPVariant, number>;
  explanation: string;
  scenario: string;
}

export function WinnerAnnouncement({ winner, scores, explanation, scenario }: WinnerAnnouncementProps) {
  const variantInfo = TCP_VARIANTS.find(v => v.id === winner)!;
  
  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${variantInfo.color}40 0%, transparent 70%)`
        }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${variantInfo.color}20`, border: `2px solid ${variantInfo.color}` }}
          >
            <Trophy className="w-6 h-6" style={{ color: variantInfo.color }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Winner: {scenario}</h3>
            <p className="text-sm text-muted-foreground">Multi-metric decision framework result</p>
          </div>
        </div>
        
        <div 
          className="text-2xl font-bold mb-4"
          style={{ color: variantInfo.color }}
        >
          {variantInfo.name}
        </div>
        
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {explanation}
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TCP_VARIANTS.map(variant => {
            const score = scores[variant.id];
            const isWinner = variant.id === winner;
            
            return (
              <div 
                key={variant.id}
                className={`
                  p-3 rounded-lg border transition-all
                  ${isWinner 
                    ? 'border-2' 
                    : 'border-border/50 opacity-70'
                  }
                `}
                style={isWinner ? { borderColor: variant.color } : {}}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: variant.color }}
                  />
                  <span className="text-xs font-medium truncate">{variant.name.replace('TCP ', '')}</span>
                </div>
                <div className="font-mono text-lg font-bold" style={{ color: variant.color }}>
                  {(score * 100).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">score</div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Throughput: 50%</span>
            </div>
            <div className="flex items-center gap-1">
              <Scale className="w-3 h-3" />
              <span>Fairness: 25%</span>
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>Stability: 25%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
