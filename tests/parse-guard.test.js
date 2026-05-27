// SRcore #1099 (fleet sweep from #956) — parse-guard CI gate for shipped JS.
//
// Brew #953 root cause: a duplicate top-level `const formatDate` inside the
// page-bootstrap IIFE raised `SyntaxError: Identifier 'formatDate' has
// already been declared` at parse time. The whole IIFE body then never ran;
// mobile menu / opening-hours / reservation form silently died. CI was
// green because no test parsed the shipped file.
//
// `node --check <file>` is the cheap structural guard: it parses without
// executing. Any duplicate identifier, mismatched brace, or invalid token
// surfaces as a non-zero exit. Fleet pattern (aventera/dish/synth/...).
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');

const candidates = [
  'js/app.js',
  'public/js/app.js',
  'public/app.js',
  'script.js',
  'public/script.js',
];

describe('parse-guard (srcore#1099 / #956)', () => {
  const found = candidates
    .map((rel) => join(root, rel))
    .filter((abs) => existsSync(abs));

  it('finds at least one shipped JS file', () => {
    expect(found.length, `no shipped JS found — looked for ${candidates.join(', ')}`).toBeGreaterThan(0);
  });

  for (const file of found) {
    it(`node --check passes: ${file.slice(root.length + 1)}`, () => {
      expect(
        () => execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }),
        `parse failed for ${file}. Likely SyntaxError (e.g. duplicate top-level identifier inside an IIFE). See srcore#956.`,
      ).not.toThrow();
    });
  }
});
