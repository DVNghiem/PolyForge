import { PfPluginApi, TypedHookContext, BeforePromptBuildEvent, BeforePromptBuildResult } from '../types.js';
import { LOG_PREFIX } from '../constants.js';
import { contextCollector } from '../features/context-collector.js';

/** File extension to language mapping */
const EXT_LANG_MAP: Record<string, string> = {
  '.rs': 'rust',
  '.py': 'python',
  '.pyi': 'python',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.go': 'go',
  '.java': 'java',
  '.kt': 'kotlin',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.rb': 'ruby',
  '.swift': 'swift',
  '.zig': 'zig',
};

/** Patterns that suggest a specific language context */
const LANG_PATTERNS: Array<{ pattern: RegExp; language: string }> = [
  { pattern: /cargo\.toml|\.rs\b|use\s+(?:std|tokio|serde)/i, language: 'rust' },
  { pattern: /requirements\.txt|\.py\b|import\s+(?:os|sys|django|flask)|def\s+\w+\s*\(/i, language: 'python' },
  { pattern: /tsconfig\.json|\.tsx?\b|import\s+.*from\s+['"]|interface\s+\w+/i, language: 'typescript' },
  { pattern: /go\.mod|\.go\b|package\s+main|func\s+\w+/i, language: 'go' },
  { pattern: /Cargo\.lock/i, language: 'rust' },
  { pattern: /package\.json|node_modules/i, language: 'typescript' },
  { pattern: /pyproject\.toml|setup\.py|poetry\.lock/i, language: 'python' },
];

function detectLanguages(text: string): string[] {
  const detected = new Set<string>();

  // Check for file extensions mentioned in text
  for (const [ext, lang] of Object.entries(EXT_LANG_MAP)) {
    if (text.includes(ext)) {
      detected.add(lang);
    }
  }

  // Check for language patterns
  for (const { pattern, language } of LANG_PATTERNS) {
    if (pattern.test(text)) {
      detected.add(language);
    }
  }

  return Array.from(detected);
}

export function registerLangDetector(api: PfPluginApi): void {
  api.on<BeforePromptBuildEvent, BeforePromptBuildResult>(
    'before_prompt_build',
    (event: BeforePromptBuildEvent, ctx: TypedHookContext): BeforePromptBuildResult | void => {
      const userMessage = event.userMessage ?? event.latestMessage ?? '';
      if (!userMessage || userMessage.length < 5) return;

      const langs = detectLanguages(userMessage);
      if (langs.length === 0) return;

      const sessionKey = ctx.sessionKey ?? 'default';
      const langList = langs.join(', ');
      api.logger.info(`${LOG_PREFIX} lang-detector: detected languages [${langList}]`);

      contextCollector.register(sessionKey, {
        id: 'lang-detect',
        source: 'plugin',
        content: `Detected language context: ${langList}. Write idiomatic code for ${langs[0]}. Follow ${langs[0]} best practices and conventions.`,
        priority: 'normal',
        oneShot: true,
      });
    },
    { priority: 70 },
  );
}
