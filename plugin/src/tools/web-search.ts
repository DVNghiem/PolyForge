import { Type, type Static } from '@sinclair/typebox';
import { PfPluginApi, ToolResult } from '../types.js';
import { LOG_PREFIX } from '../constants.js';
import { toolResponse, toolError } from '../utils/helpers.js';

const SearchParams = Type.Object({
  query: Type.String({ description: 'The search query.' }),
  maxResults: Type.Optional(Type.Integer({ description: 'Maximum number of results to return (default: 5).', minimum: 1, maximum: 20 })),
});

type SearchInput = Static<typeof SearchParams>;

export function registerWebSearchTool(api: PfPluginApi): void {
  api.registerTool<SearchInput>({
    name: 'pf_search',
    description:
      'Web search tool. Performs a web search and returns summarized results. ' +
      'Used as the primary search primitive for research workflows.',
    parameters: SearchParams,
    execute: async (_toolCallId, params): Promise<ToolResult> => {
      const { query, maxResults = 5 } = params;

      if (!query || query.trim().length === 0) {
        return toolError('Search query is required.');
      }

      api.logger.info(`${LOG_PREFIX} pf_search: query="${query}" maxResults=${maxResults}`);

      const searchInstruction = [
        `## Web Search`,
        ``,
        `**Query:** ${query}`,
        `**Max Results:** ${maxResults}`,
        ``,
        `### Instructions`,
        `Perform a web search for the query above. Use any available search tools or MCP servers.`,
        `Return the top ${maxResults} results with:`,
        `- Title`,
        `- URL`,
        `- Brief summary (2-3 sentences)`,
        ``,
        `If no search tool is available, use the best available method to find relevant information.`,
      ];

      return toolResponse(searchInstruction.join('\n'));
    },
  });
}
