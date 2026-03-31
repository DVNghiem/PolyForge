# TypeScript Backend

TypeScript backend development patterns for PolyForge agents.

## Runtime

- **Bun** (preferred for new projects): fast startup, built-in test runner, native TypeScript
- **Node.js 22+**: stable LTS, broad ecosystem, `--experimental-strip-types` for native TS

## Web Frameworks

- **Fastify**: high performance, schema validation, plugin system
- **Hono**: lightweight, works on Bun/Deno/Node/edge, web-standards API
- **Express**: legacy projects only; avoid for new work

## Typing

- **Zod** for runtime validation: `z.object({ name: z.string() })` → parse untrusted input
- `satisfies` operator for type checking without widening: `const config = { ... } satisfies Config`
- Strict `tsconfig.json`: `"strict": true`, `"noUncheckedIndexedAccess": true`
- Avoid `any` — use `unknown` + type guards or Zod parsing

## Testing

- **Vitest**: fast, ESM-native, compatible with Jest API
- `supertest` for HTTP integration testing
- Mock patterns: `vi.mock()` for modules, `vi.fn()` for functions
- Test naming: `it('should reject expired tokens with 401')`

## Monorepo

- **pnpm workspaces** for dependency management
- `tsconfig` path aliases: `"@app/*": ["./src/*"]`
- Shared packages in `packages/` directory
- Turborepo or Nx for build orchestration

## ESM

- `"type": "module"` in `package.json`
- `.js` extensions in import paths (even for `.ts` files): `import { foo } from './bar.js'`
- `tsx` for running TypeScript scripts directly
- Avoid mixing CJS and ESM in the same package

## Anti-Patterns

- `any` type annotations — use `unknown` or generics
- Missing `await` on promises (fire-and-forget errors)
- `require()` in ESM modules — use `import`
- `console.log` for production logging — use a structured logger
- Implicit `undefined` returns in functions that should return a value
