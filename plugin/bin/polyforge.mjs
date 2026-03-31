#!/usr/bin/env node

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const entryPath = resolve(__dirname, '..', 'dist', 'cli.js');

import(entryPath).catch((err) => {
  console.error('Failed to load PolyForge CLI:', err.message);
  process.exit(1);
});
