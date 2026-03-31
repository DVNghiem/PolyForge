#!/usr/bin/env node

/**
 * Syncs the version from plugin/package.json to openclaw.plugin.json
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const pkg = JSON.parse(readFileSync(resolve(root, 'plugin/package.json'), 'utf-8'));
const manifestPath = resolve(root, 'plugin/openclaw.plugin.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

manifest.version = pkg.version;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(`Synced version to ${pkg.version}`);
