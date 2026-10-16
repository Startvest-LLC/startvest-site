// Build check: every HTML page must link a stylesheet that exists in dist.
// Added after an upgrade silently stopped emitting CSS while every route
// still returned 200. Usage: node scripts/check-build.mjs dist
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = process.argv[2] || 'dist';
const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (extname(p) === '.html') pages.push(p);
  }
})(root);

const failures = [];
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const hrefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((h) => h.startsWith('/'));
  if (hrefs.length === 0) failures.push(`${page}: no local stylesheet linked`);
  for (const h of hrefs) {
    const file = join(root, h.split('?')[0]);
    if (!existsSync(file) || statSync(file).size === 0) failures.push(`${page}: ${h} is missing or empty`);
  }
}

if (failures.length) {
  console.error(`build check failed (${failures.length}):\n` + failures.join('\n'));
  process.exit(1);
}
console.log(`build check passed (${pages.length} pages, stylesheets present)`);
