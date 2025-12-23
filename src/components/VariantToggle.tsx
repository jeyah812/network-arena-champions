import { TCP_VARIANTS, TCPVariant } from '@/lib/tcpSimulation';
import { Switch } from '@/components/ui/switch';

interface VariantToggleProps {
  activeVariants: Set<TCPVariant>;
  onToggle: (variant: TCPVariant) => void;
}

export function VariantToggle({ activeVariants, onToggle }: VariantToggleProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">TCP Variants</h3>
      <div className="space-y-3">
        {TCP_VARIANTS.map(variant => (
          <div 
            key={variant.id}
            className={`
              flex items-center justify-between p-3 rounded-lg border transition-all duration-200
              ${activeVariants.has(variant.id) 
                ? 'border-border bg-secondary/50' 
                : 'border-transparent bg-transparent opacity-60'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: variant.color }}
              />
              <div>
                <span className="font-medium text-sm">{variant.name}</span>
                <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                  {variant.description}
                </p>
              </div>
            </div>
            <Switch
              checked={activeVariants.has(variant.id)}
              onCheckedChange={() => onToggle(variant.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
