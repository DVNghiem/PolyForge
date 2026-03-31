import { Type, type Static } from '@sinclair/typebox';
import { PfPluginApi, ToolResult } from '../types.js';
import { LOG_PREFIX } from '../constants.js';
import { toolResponse, toolError } from '../utils/helpers.js';

const IntakeParams = Type.Object({
  description: Type.String({ description: 'The raw task description from a PM, issue, or requirement doc.' }),
  context: Type.Optional(Type.String({ description: 'Additional context: links, related files, team constraints.' })),
});

type IntakeInput = Static<typeof IntakeParams>;

export function registerIntakeTool(api: PfPluginApi): void {
  api.registerTool<IntakeInput>({
    name: 'pf_intake',
    description:
      'Structured task intake. Parses a raw task description into a Task Brief JSON ' +
      'with requirements, constraints, acceptance criteria, and unknowns. ' +
      'Use when receiving tasks from PMs, issue trackers, or team members.',
    parameters: IntakeParams,
    execute: async (_toolCallId, params): Promise<ToolResult> => {
      const { description, context } = params;

      if (!description || description.trim().length === 0) {
        return toolError('Task description is required.');
      }

      api.logger.info(`${LOG_PREFIX} pf_intake: processing task intake (${description.length} chars)`);

      const intakeInstructions = [
        `## Task Intake`,
        ``,
        `### Raw Description`,
        description,
        context ? `\n### Additional Context\n${context}` : '',
        ``,
        `### Instructions`,
        `Analyze the above task description and produce a **Task Brief** as JSON:`,
        ``,
        '```json',
        `{`,
        `  "title": "<concise task title>",`,
        `  "type": "feature | bug | refactor | research | docs",`,
        `  "language": "python | rust | typescript | mixed | unknown",`,
        `  "requirements": [`,
        `    "<requirement 1>",`,
        `    "<requirement 2>"`,
        `  ],`,
        `  "constraints": [`,
        `    "<constraint 1>"`,
        `  ],`,
        `  "acceptance_criteria": [`,
        `    "<measurable criterion 1>",`,
        `    "<measurable criterion 2>"`,
        `  ],`,
        `  "unknowns": [`,
        `    "<unclear item 1>"`,
        `  ],`,
        `  "suggested_category": "quick | deep | apex | research | rust | python | typescript | review | writing | unspecified-low | unspecified-high"`,
        `}`,
        '```',
        ``,
        `### Intake Rules`,
        `- Every acceptance criterion must be measurable and binary (pass/fail)`,
        `- If language is unclear from the description, set to "unknown" and add to unknowns`,
        `- If scope is vague, set suggested_category to "unspecified-high" and list what needs clarification in unknowns`,
        `- Identify implicit constraints the PM may not have stated (e.g., backward compatibility, performance budgets)`,
        `- Batch clarifying questions (max 5) — prioritize blockers over nice-to-haves`,
      ];

      return toolResponse(intakeInstructions.filter(Boolean).join('\n'));
    },
  });
}
