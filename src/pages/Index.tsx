import { useState, useEffect, useCallback } from 'react';
import { Play, RefreshCw, TrendingUp, Scale, Activity, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { SimulationChart } from '@/components/SimulationChart';
import { ThroughputChart } from '@/components/ThroughputChart';
import { MetricCard } from '@/components/MetricCard';
import { ScenarioSelector } from '@/components/ScenarioSelector';
import { VariantToggle } from '@/components/VariantToggle';
import { WinnerAnnouncement } from '@/components/WinnerAnnouncement';
import { EducationalPanel } from '@/components/EducationalPanel';
import {
  runSimulation,
  determineWinner,
  NetworkScenario,
  TCPVariant,
  SimulationResult,
  getScenarioConfig
} from '@/lib/tcpSimulation';

const Index = () => {
  const [scenario, setScenario] = useState<NetworkScenario>('wifi');
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [activeVariants, setActiveVariants] = useState<Set<TCPVariant>>(
    new Set(['tahoe', 'reno', 'cubic', 'adaptive'])
  );
  const [winner, setWinner] = useState<{
    winner: TCPVariant;
    scores: Record<TCPVariant, number>;
    explanation: string;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedEducationalVariant, setSelectedEducationalVariant] = useState<TCPVariant>('tahoe');

  const runSim = useCallback(() => {
    setIsSimulating(true);
    
    // Small delay for animation effect
    setTimeout(() => {
      const simResults = runSimulation(scenario, 100);
      setResults(simResults);
      
      const winnerResult = determineWinner(simResults);
      setWinner(winnerResult);
      setIsSimulating(false);
    }, 500);
  }, [scenario]);

  useEffect(() => {
    runSim();
  }, []);

  const handleScenarioChange = (newScenario: NetworkScenario) => {
    setScenario(newScenario);
  };

  const handleToggleVariant = (variant: TCPVariant) => {
    setActiveVariants(prev => {
      const next = new Set(prev);
      if (next.has(variant)) {
        next.delete(variant);
      } else {
        next.add(variant);
      }
      return next;
    });
    setSelectedEducationalVariant(variant);
  };

  const scenarioConfig = getScenarioConfig(scenario);

  // Calculate aggregate metrics
  const avgThroughput = results.length > 0 
    ? results.reduce((sum, r) => sum + r.throughput, 0) / results.length 
    : 0;
  const avgStability = results.length > 0 
    ? results.reduce((sum, r) => sum + r.stability, 0) / results.length 
    : 0;
  const fairnessIndex = results.length > 0 ? results[0].fairness : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative border-b border-border/50 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0" style={{ background: 'var(--gradient-glow-tahoe)' }} />
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Academic Simulation Project
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              TCP Congestion Control
              <span className="text-gradient block">Comparative Analysis</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Explore how different TCP variants compete in various network conditions. 
              Analyze throughput, fairness, and stability across Mobile, Wi-Fi, and Data Center scenarios.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="glow" 
                size="lg" 
                onClick={runSim}
                disabled={isSimulating}
                className="gap-2"
              >
                {isSimulating ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                {isSimulating ? 'Simulating...' : 'Run Simulation'}
              </Button>
              <Button variant="outline" size="lg" onClick={runSim} className="gap-2">
                <RefreshCw className="w-5 h-5" />
                New Seed
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Scenario and Controls */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ScenarioSelector selected={scenario} onSelect={handleScenarioChange} />
          </div>
          <VariantToggle activeVariants={activeVariants} onToggle={handleToggleVariant} />
        </div>

        {/* Metrics Dashboard */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Avg. Throughput"
            value={avgThroughput}
            unit="MSS/RTT"
            icon={TrendingUp}
            color="tahoe"
          />
          <MetricCard
            title="Jain's Fairness"
            value={fairnessIndex}
            unit="%"
            icon={Scale}
            color="reno"
          />
          <MetricCard
            title="Avg. Stability"
            value={avgStability}
            unit="%"
            icon={Activity}
            color="cubic"
          />
          <MetricCard
            title="Loss Rate"
            value={(scenarioConfig.lossRate * 100).toFixed(1)}
            unit="%"
            icon={Zap}
            color="adaptive"
          />
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <SimulationChart results={results} activeVariants={activeVariants} />
          </div>
          <div className="lg:col-span-2">
            <ThroughputChart results={results} winner={winner?.winner || null} />
          </div>
        </div>

        {/* Winner and Educational Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {winner && (
            <WinnerAnnouncement
              winner={winner.winner}
              scores={winner.scores}
              explanation={winner.explanation}
              scenario={scenarioConfig.name}
            />
          )}
          <EducationalPanel selectedVariant={selectedEducationalVariant} />
        </div>

        {/* Footer Info */}
        <footer className="glass-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Computer Networks Project</span>
            {' · '}
            Simulation of TCP Tahoe, Reno, CUBIC, and Adaptive mechanisms
            {' · '}
            Multi-metric decision framework with scenario-based analysis
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
