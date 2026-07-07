#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const PACKAGE_NAME = 'mivix-ui';

function loadTokenFromFile(file = '.env.npm') {
  if (!existsSync(file)) return;

  const content = readFileSync(file, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const equalsAt = line.indexOf('=');
    if (equalsAt === -1) continue;
    const key = line.slice(0, equalsAt).trim();
    const value = line.slice(equalsAt + 1).trim();
    if (key === 'NPM_TOKEN' && !(key in process.env) && value) {
      process.env[key] = value;
    }
  }
}

function runNpmCommand(command, args) {
  const result = spawnSync('npm', [command, ...args], {
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

loadTokenFromFile();

if (!process.env.NPM_TOKEN) {
  console.error('Missing NPM_TOKEN. Set it in .env.npm or export it in your shell.');
  process.exit(1);
}

const args = process.argv.slice(2);
const mode = args[0] || 'alpha';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const version = pkg.version;

if (mode === 'alpha') {
  runNpmCommand('publish', ['--tag', 'alpha', '--access', 'public']);
} else if (mode === 'alpha-latest') {
  runNpmCommand('publish', ['--tag', 'alpha', '--access', 'public']);
  runNpmCommand('dist-tag', ['add', `${PACKAGE_NAME}@${version}`, 'latest']);
} else if (mode === 'set-latest') {
  runNpmCommand('dist-tag', ['add', `${PACKAGE_NAME}@${version}`, 'latest']);
} else {
  console.error(`Unknown publish mode: ${mode}`);
  console.error('Available modes: alpha, alpha-latest, set-latest');
  process.exit(1);
}
