// plugin/src/lib/quality-evaluator.ts

import { PhaseName } from './types/workflow-types.js';

interface QualityResult {
  passed: boolean;
  score: number;
  feedback: string;
  details: Record<string, unknown>;
}

interface QualityGate {
  phase: PhaseName;
  criteria: Array<{
    name: string;
    check: (deliverables: Record<string, unknown>) => QualityResult;
  }>;
  passThreshold: number;
}

const QUALITY_GATES: Partial<Record<PhaseName, QualityGate>> = {
  divergent: {
    phase: 'divergent',
    criteria: [
      {
        name: 'min_approaches',
        check: (d) => {
          const approaches = d.approaches as Array<unknown> | undefined;
          const count = approaches?.length || 0;
          return {
            passed: count >= 3,
            score: Math.min(1.0, count / 5),
            feedback: count < 3 ? `Only ${count}/3 approaches documented` : `${count} approaches - good coverage`,
            details: { count },
          };
        },
      },
      {
        name: 'implementation_sketches',
        check: (d) => {
          const approaches = d.approaches as Array<{ implementation_sketch?: string }> | undefined;
          if (!approaches) return { passed: false, score: 0, feedback: 'No approaches found', details: {} };
          const withSketches = approaches.filter(a => a.implementation_sketch && a.implementation_sketch.length > 100);
          const score = withSketches.length / approaches.length;
          return {
            passed: score === 1.0,
            score,
            feedback: score < 1.0 ? `${approaches.length - withSketches.length} approaches lack sketches` : "All have sketches",
            details: { with_sketches: withSketches.length, total: approaches.length },
          };
        },
      },
    ],
    passThreshold: 0.75,
  },
  // Add gates for other phases as needed
};

export function evaluateQuality(phase: PhaseName, deliverables: Record<string, unknown>): { 
  passed: boolean; 
  score: number; 
  feedback: string;
  results: QualityResult[];
} {
  const gate = QUALITY_GATES[phase];
  if (!gate) {
    return { passed: true, score: 1.0, feedback: 'No quality gate defined', results: [] };
  }

  const results = gate.criteria.map(c => c.check(deliverables));
  const totalScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const passedCriteria = results.filter(r => r.passed).length / results.length;

  return {
    passed: passedCriteria >= gate.passThreshold,
    score: totalScore,
    feedback: passedCriteria >= gate.passThreshold ? 'Quality gate passed' : 'Quality gate failed',
    results,
  };
}
