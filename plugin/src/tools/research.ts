import { Type, type Static } from '@sinclair/typebox';
import { PfPluginApi, ToolResult } from '../types.js';
import { LOG_PREFIX } from '../constants.js';
import { toolResponse, toolError } from '../utils/helpers.js';
import { getConfig } from '../utils/config.js';

const ResearchParams = Type.Object({
  topic: Type.String({ description: 'Technology, library, or concept to research.' }),
  goal: Type.String({ description: 'What decision this research should inform (e.g., "Should we use Axum or Actix-Web?").' }),
  depth: Type.Optional(
    Type.Unsafe<'shallow' | 'standard' | 'deep'>({
      description: 'Research depth: shallow (quick overview), standard (default), deep (thorough investigation).',
    }),
  ),
});

type ResearchInput = Static<typeof ResearchParams>;

export function registerResearchTool(api: PfPluginApi): void {
  api.registerTool<ResearchInput>({
    name: 'pf_research',
    description:
      'Structured technology research. Takes a topic and research goal, orchestrates ' +
      'web search + doc search + synthesis, returns a structured tech brief. ' +
      'Use for evaluating libraries, frameworks, or technology decisions.',
    parameters: ResearchParams,
    execute: async (_toolCallId, params): Promise<ToolResult> => {
      const { topic, goal } = params;
      const config = getConfig(api);
      const depth = params.depth ?? config.research_depth;

      if (!topic || topic.trim().length === 0) {
        return toolError('Topic is required.');
      }
      if (!goal || goal.trim().length === 0) {
        return toolError('Research goal is required.');
      }

      api.logger.info(`${LOG_PREFIX} pf_research: topic="${topic}" goal="${goal}" depth=${depth}`);

      const depthInstructions: Record<string, string> = {
        shallow: 'Quick overview — 2-3 searches, focus on official docs and one comparison.',
        standard: 'Standard research — 4-6 searches, include benchmarks, community sentiment, GitHub health.',
        deep: 'Deep investigation — 8+ searches, include source code analysis, all alternatives, production case studies.',
      };

      const researchPlan = [
        `## Technology Research: ${topic}`,
        ``,
        `**Goal:** ${goal}`,
        `**Depth:** ${depth}`,
        `**Depth Instructions:** ${depthInstructions[depth]}`,
        ``,
        `### Research Plan`,
        ``,
        `#### Phase 1: Official Documentation`,
        `- Search for official documentation for "${topic}"`,
        `- If context7 MCP is available: resolve-library-id("${topic}") → query-docs`,
        `- Extract: API overview, key features, getting started guide`,
        ``,
        `#### Phase 2: Community & Ecosystem`,
        `- pf_search("${topic} benchmark ${new Date().getFullYear()}")`,
        `- pf_search("${topic} vs alternatives comparison")`,
        `- pf_search("${topic} production experience")`,
        depth === 'deep' ? `- pf_search("${topic} known issues limitations")` : '',
        depth === 'deep' ? `- pf_search("${topic} migration guide")` : '',
        ``,
        `#### Phase 3: Repository Health`,
        `- Check GitHub for: stars, recent commits, open issues, PR velocity`,
        `- Assess maintainer responsiveness`,
        depth !== 'shallow' ? `- Check release frequency and breaking change history` : '',
        ``,
        `#### Phase 4: Synthesis → Tech Brief`,
        `Write a structured Tech Brief with these sections:`,
        `- **Summary** (2-3 sentences)`,
        `- **Pros** (bullet list)`,
        `- **Cons** (bullet list)`,
        `- **Performance** (benchmarks or estimates)`,
        `- **Maturity** (stable/growing/experimental)`,
        `- **Community** (active/moderate/sparse)`,
        `- **Fit Assessment** (for our specific goal)`,
        `- **Recommendation** (adopt / evaluate further / reject)`,
        `- **Confidence** (HIGH / MEDIUM / LOW)`,
        ``,
        `#### Phase 5: Save`,
        `- Save the tech brief to: workspace/research/<date>_${topic.replace(/\s+/g, '-').toLowerCase()}.md`,
        `- Present the brief to the user`,
        ``,
        `### Hard Rules`,
        `- Never recommend without checking current GitHub activity`,
        `- Always include at least one alternative in the comparison`,
        `- Always state confidence level`,
      ];

      return toolResponse(researchPlan.filter(Boolean).join('\n'));
    },
  });
}
