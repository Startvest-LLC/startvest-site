// Fails the build output if it contains em dashes or banned phrases from Tom's voice rules.
// Usage: node scripts/check-voice.mjs dist
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = process.argv[2] ?? 'dist';
const BANNED = [
  'leverage', 'passionate', 'thought leader', 'synergy', 'cutting-edge', 'cutting edge',
  'seamless', 'game-changer', 'game changer', 'best-in-class', 'revolutioniz', 'revolutionary',
  'enterprise-grade', 'disrupt', 'bespoke', 'artisanal',
];
const CHECK_EXT = new Set(['.html', '.xml', '.txt']);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const problems = [];
for (const file of walk(root)) {
  if (!CHECK_EXT.has(extname(file))) continue;
  const text = readFileSync(file, 'utf8')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
  if (text.includes('—')) problems.push(`${file}: em dash`);
  const lower = text.toLowerCase();
  for (const w of BANNED) if (lower.includes(w)) problems.push(`${file}: "${w}"`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`voice check passed (${root})`);
