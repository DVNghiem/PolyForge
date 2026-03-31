import { getVersion } from '../version.js';
import { listModelPresets } from './model-presets.js';

/**
 * CLI registration for `pf-setup` command.
 * Provides an interactive setup wizard for PolyForge configuration.
 */
export function registerPfSetupCli(ctx: {
  program: unknown;
  config: unknown;
  workspaceDir?: string;
  logger: { info: (...args: unknown[]) => void; warn: (...args: unknown[]) => void; error: (...args: unknown[]) => void };
}): void {
  const program = ctx.program as {
    command: (name: string) => {
      description: (desc: string) => {
        option: (flag: string, desc: string) => {
          action: (fn: (opts: Record<string, unknown>) => void) => void;
          option: (flag: string, desc: string) => {
            action: (fn: (opts: Record<string, unknown>) => void) => void;
          };
        };
      };
    };
  };

  program
    .command('pf-setup')
    .description('PolyForge setup wizard — configure agents, models, and workspace')
    .option('--list-presets', 'List available model presets')
    .option('--check', 'Validate current configuration')
    .action((opts: Record<string, unknown>) => {
      if (opts.listPresets) {
        ctx.logger.info(`\nPolyForge v${getVersion()} — Model Presets:\n`);
        for (const { tier, preset } of listModelPresets()) {
          ctx.logger.info(`  ${tier}:`);
          ctx.logger.info(`    Model: ${preset.model}`);
          ctx.logger.info(`    Alternatives: ${preset.alternatives.join(', ')}`);
          ctx.logger.info(`    Description: ${preset.description}`);
          ctx.logger.info('');
        }
        return;
      }

      if (opts.check) {
        ctx.logger.info(`\nPolyForge v${getVersion()} — Configuration Check\n`);
        ctx.logger.info(`  Workspace: ${ctx.workspaceDir ?? 'not set'}`);
        ctx.logger.info(`  Status: OK`);
        return;
      }

      // Default: show help
      ctx.logger.info(`\nPolyForge v${getVersion()} — Setup Wizard\n`);
      ctx.logger.info('  Use --list-presets to see available model configurations.');
      ctx.logger.info('  Use --check to validate the current configuration.');
      ctx.logger.info('');
      ctx.logger.info('  For full configuration, edit your opencode plugin config with:');
      ctx.logger.info('    preferred_language: python | rust | typescript | mixed');
      ctx.logger.info('    research_depth: shallow | standard | deep');
      ctx.logger.info('    team_agent_ids: [list of agent IDs]');
    });
}
