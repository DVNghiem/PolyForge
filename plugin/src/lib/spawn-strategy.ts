// plugin/src/lib/spawn-strategy.ts

interface SpawnStrategy {
  shouldSpawn: boolean;
  reason: string;
  mode: 'nested' | 'detached' | 'sequential';
  suggestedAgents: Array<{
    agentType: string;
    taskPartition: string;
    estimatedEffort: 'low' | 'medium' | 'high';
  }>;
  parallelizationBenefit: number;
  riskLevel: 'low' | 'medium' | 'high';
}

function estimateTaskSize(task: string): 'tiny' | 'small' | 'medium' | 'large' | 'huge' {
  const words = task.split(/\s+/).length;
  const hasComplexKeywords = ['redesign', 'architecture', 'overhaul', 'redesign'].some(k => task.includes(k));
  
  if (words < 20 && !hasComplexKeywords) return 'tiny';
  if (words < 50 && !hasComplexKeywords) return 'small';
  if (words < 100) return 'medium';
  if (words < 200) return 'large';
  return 'huge';
}

function identifyParallelizable(task: string): string[] {
  const parallelMarkers = ['and', 'then', 'parallel', 'concurrently', 'independent'];
  return parallelMarkers.filter(m => task.toLowerCase().includes(m));
}

export function analyzeSpawnStrategy(task: string, workflow: string, phase: string): SpawnStrategy {
  const taskSize = estimateTaskSize(task);
  const parallelizable = identifyParallelizable(task);

  // Tiny/small tasks don't benefit from spawning overhead
  if (taskSize === 'tiny' || taskSize === 'small') {
    return {
      shouldSpawn: false,
      reason: `Task is ${taskSize} - spawning overhead not worth it`,
      mode: 'sequential',
      suggestedAgents: [],
      parallelizationBenefit: 0,
      riskLevel: 'low',
    };
  }

  // Good parallel candidates
  if (taskSize >= 'medium' && parallelizable.length >= 1) {
    return {
      shouldSpawn: true,
      reason: `Task has ${parallelizable.length} independent components`,
      mode: 'nested',
      suggestedAgents: [
        { agentType: 'pf_sprint', taskPartition: task.split(',')[0] || task, estimatedEffort: taskSize as any },
      ],
      parallelizationBenefit: 0.4,
      riskLevel: 'medium',
    };
  }

  return {
    shouldSpawn: false,
    reason: `Task characteristics don't favor spawning`,
    mode: 'sequential',
    suggestedAgents: [],
    parallelizationBenefit: 0,
    riskLevel: 'low',
  };
}
