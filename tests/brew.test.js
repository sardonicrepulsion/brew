import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dirname, '..');

describe('brew project structure', () => {
  it('index.html exists', () => {
    expect(existsSync(join(root, 'index.html'))).toBe(true);
  });

  it('version.json has correct shape', () => {
    const raw = readFileSync(join(root, 'version.json'), 'utf8');
    const v = JSON.parse(raw);
    expect(v.app).toBe('brew');
    expect(v.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(v.classification).toBeTruthy();
  });

  it('Caddyfile has /healthz handler', () => {
    const caddyfile = readFileSync(join(root, 'Caddyfile'), 'utf8');
    expect(caddyfile).toContain('handle /healthz');
  });

  it('Caddyfile has /version handler', () => {
    const caddyfile = readFileSync(join(root, 'Caddyfile'), 'utf8');
    expect(caddyfile).toContain('handle /version');
  });

  it('VERSION file matches version.json', () => {
    const version = readFileSync(join(root, 'VERSION'), 'utf8').trim();
    const vJson = JSON.parse(readFileSync(join(root, 'version.json'), 'utf8'));
    expect(version).toBe(vJson.version);
  });
});
