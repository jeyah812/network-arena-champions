import { Network, Github, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/30">
              <Network className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                TCP Congestion <span className="text-gradient">Arena</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Simulation of Congestion Control Mechanisms
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Documentation</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Source</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
