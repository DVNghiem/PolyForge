import { Category, CATEGORIES } from '../../constants.js';

export interface DetectionResult {
  category: Category;
  confidence: number;
  matchedKeywords: string[];
}

const KEYWORD_MAP: Record<string, Category> = {
  // quick
  'quick fix': 'quick',
  'small change': 'quick',
  'one-liner': 'quick',
  'typo': 'quick',
  'rename': 'quick',
  'simple': 'quick',

  // deep
  'refactor': 'deep',
  'deep dive': 'deep',
  'redesign': 'deep',
  'architecture': 'deep',
  'complex': 'deep',
  'overhaul': 'deep',

  // apex
  'apex': 'apex',
  'ultra brain': 'apex',
  'maximum depth': 'apex',
  'hardest': 'apex',
  'most complex': 'apex',

  // research
  'research': 'research',
  'investigate': 'research',
  'explore': 'research',
  'find out': 'research',
  'look into': 'research',
  'study': 'research',
  'survey': 'research',
  'literature': 'research',
  'state of the art': 'research',

  // rust
  'rust': 'rust',
  'cargo': 'rust',
  'crate': 'rust',
  'rustc': 'rust',
  'tokio': 'rust',
  'async rust': 'rust',
  'borrow checker': 'rust',
  'lifetime': 'rust',
  '.rs file': 'rust',

  // python
  'python': 'python',
  'pip': 'python',
  'pytest': 'python',
  'django': 'python',
  'flask': 'python',
  'fastapi': 'python',
  '.py file': 'python',
  'virtualenv': 'python',
  'poetry': 'python',

  // typescript
  'typescript': 'typescript',
  'ts': 'typescript',
  'tsx': 'typescript',
  'npm': 'typescript',
  'node': 'typescript',
  'deno': 'typescript',
  'bun': 'typescript',
  '.ts file': 'typescript',

  // review
  'review': 'review',
  'code review': 'review',
  'pull request': 'review',
  'pr review': 'review',
  'audit': 'review',
  'check my code': 'review',
  'feedback': 'review',

  // writing
  'write docs': 'writing',
  'documentation': 'writing',
  'readme': 'writing',
  'blog post': 'writing',
  'technical writing': 'writing',
  'explain': 'writing',
};

export function detectCategory(text: string): DetectionResult | null {
  const lower = text.toLowerCase();
  const scores = new Map<Category, string[]>();

  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) {
      const existing = scores.get(category) ?? [];
      existing.push(keyword);
      scores.set(category, existing);
    }
  }

  if (scores.size === 0) return null;

  let bestCategory: Category = 'unspecified-low';
  let bestCount = 0;
  let bestKeywords: string[] = [];

  for (const [cat, keywords] of scores) {
    if (keywords.length > bestCount) {
      bestCategory = cat;
      bestCount = keywords.length;
      bestKeywords = keywords;
    }
  }

  const confidence = Math.min(1.0, bestCount * 0.3 + 0.2);

  return {
    category: bestCategory,
    confidence,
    matchedKeywords: bestKeywords,
  };
}

export function isValidDetectedCategory(cat: string): cat is Category {
  return (CATEGORIES as readonly string[]).includes(cat);
}
