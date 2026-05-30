import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function findProjectRoot(): string {
  let dir = path.resolve(__dirname, '..');

  for (let i = 0; i < 6; i++) {
    if (
      existsSync(path.join(dir, 'client')) &&
      existsSync(path.join(dir, 'server')) &&
      existsSync(path.join(dir, 'skills'))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return process.cwd();
}

export function getClientDistPath(): string {
  return path.join(findProjectRoot(), 'client/dist');
}

export function getQuotesPath(): string {
  return path.join(findProjectRoot(), 'server/data/quotes.json');
}

export function getSkillPath(): string {
  return path.join(findProjectRoot(), 'skills/maoxuan-skill/SKILL.md');
}
