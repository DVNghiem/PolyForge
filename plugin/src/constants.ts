export const PLUGIN_ID = 'polyforge';
export const TOOL_PREFIX = 'pf_';
export const LOG_PREFIX = '[polyforge]';
export const ABSOLUTE_MAX_AUTO_ITERATIONS = 100;

/** Tools that read-only agents must NOT use */
export const READ_ONLY_DENY = [
  'write',
  'edit',
  'patch',
  'bash',
  'shell',
  'exec',
  'terminal',
  'run',
  'create_file',
  'delete_file',
  'move_file',
  'rename_file',
  'sessions_spawn',
  `${TOOL_PREFIX}delegate`,
  `${TOOL_PREFIX}spawn_acp`,
  `${TOOL_PREFIX}todo_create`,
  `${TOOL_PREFIX}todo_update`,
  `${TOOL_PREFIX}checkpoint`,
];

export const CATEGORIES = [
  'quick',
  'deep',
  'apex',
  'research',
  'rust',
  'python',
  'typescript',
  'review',
  'writing',
  'unspecified-low',
  'unspecified-high',
] as const;

export type Category = (typeof CATEGORIES)[number];
