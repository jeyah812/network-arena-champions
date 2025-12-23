import { NetworkScenario, getScenarioConfig } from '@/lib/tcpSimulation';
import { Smartphone, Wifi, Server } from 'lucide-react';

interface ScenarioSelectorProps {
  selected: NetworkScenario;
  onSelect: (scenario: NetworkScenario) => void;
}

const scenarios: { id: NetworkScenario; icon: typeof Smartphone }[] = [
  { id: 'mobile', icon: Smartphone },
  { id: 'wifi', icon: Wifi },
  { id: 'datacenter', icon: Server },
];

export function ScenarioSelector({ selected, onSelect }: ScenarioSelectorProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Network Scenario</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map(({ id, icon: Icon }) => {
          const config = getScenarioConfig(id);
          const isSelected = selected === id;
          
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-300
                ${isSelected 
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                  : 'border-border hover:border-primary/50 bg-secondary/30'
                }
              `}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`
                  p-3 rounded-xl transition-colors
                  ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary'}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{config.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                </div>
                <span className={`
                  scenario-badge
                  ${id === 'mobile' ? 'scenario-mobile' : ''}
                  ${id === 'wifi' ? 'scenario-wifi' : ''}
                  ${id === 'datacenter' ? 'scenario-datacenter' : ''}
                `}>
                  {(config.lossRate * 100).toFixed(1)}% Loss
                </span>
              </div>
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
