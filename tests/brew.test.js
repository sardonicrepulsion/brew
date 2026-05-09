import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'fs';
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

describe('external CSS and JS assets (task #436)', () => {
  it('css/app.css exists and is non-empty', () => {
    const cssPath = join(root, 'css', 'app.css');
    expect(existsSync(cssPath)).toBe(true);
    expect(statSync(cssPath).size).toBeGreaterThan(0);
  });

  it('js/app.js exists and is non-empty', () => {
    const jsPath = join(root, 'js', 'app.js');
    expect(existsSync(jsPath)).toBe(true);
    expect(statSync(jsPath).size).toBeGreaterThan(0);
  });

  it('index.html has no inline <style> block', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    // Should have no opening <style> tag (stylesheet link is the only style reference)
    expect(html).not.toMatch(/<style>/);
    expect(html).not.toMatch(/<style\s+[^>]*>/);
  });

  it('index.html references external stylesheet via <link>', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    expect(html).toContain('rel="stylesheet"');
    expect(html).toContain('href="/css/app.css"');
  });

  it('index.html has no inline <script> block except application/ld+json', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    // Only <script type="application/ld+json"> is allowed inline
    const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>/g)]
      .filter(m => !m[0].includes('type="application/ld+json"'))
      .filter(m => !m[0].includes('src='));
    expect(inlineScripts).toHaveLength(0);
  });

  it('index.html references external JS via <script src>', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    expect(html).toContain('src="/js/app.js"');
  });

  it('application/ld+json script is kept inline', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    expect(html).toContain('type="application/ld+json"');
  });
});
