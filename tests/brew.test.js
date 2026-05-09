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

describe('strict CSP + Trusted Types (task #437)', () => {
  it('index.html has NO <meta http-equiv="Content-Security-Policy"> — server-side header is authoritative', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    expect(html).not.toContain('http-equiv="Content-Security-Policy"');
    expect(html).not.toContain("http-equiv='Content-Security-Policy'");
  });

  it('Caddyfile CSP does NOT contain unsafe-inline', () => {
    const caddyfile = readFileSync(join(root, 'Caddyfile'), 'utf8');
    expect(caddyfile).not.toContain("'unsafe-inline'");
  });

  it('Caddyfile CSP does NOT contain unsafe-eval', () => {
    const caddyfile = readFileSync(join(root, 'Caddyfile'), 'utf8');
    expect(caddyfile).not.toContain("'unsafe-eval'");
  });

  it('Caddyfile CSP does NOT contain wildcard https: src', () => {
    const caddyfile = readFileSync(join(root, 'Caddyfile'), 'utf8');
    // Allow specific https:// domains but not bare "https:" wildcard
    const cspLine = caddyfile.split('\n').find(l => l.includes('Content-Security-Policy'));
    expect(cspLine).toBeTruthy();
    // "https:" as a standalone token (not part of a URL) is a wildcard — reject it
    expect(cspLine).not.toMatch(/\bhttps:\s/);
    expect(cspLine).not.toMatch(/\bhttps:"/);
  });

  it('Caddyfile CSP includes require-trusted-types-for', () => {
    const caddyfile = readFileSync(join(root, 'Caddyfile'), 'utf8');
    expect(caddyfile).toContain("require-trusted-types-for 'script'");
  });

  it('Caddyfile CSP includes trusted-types brew-template', () => {
    const caddyfile = readFileSync(join(root, 'Caddyfile'), 'utf8');
    expect(caddyfile).toContain('trusted-types brew-template');
  });

  it('js/app.js has no bare innerHTML assignments (all DOM-safe)', () => {
    const js = readFileSync(join(root, 'js', 'app.js'), 'utf8');
    // innerHTML assignments are only allowed if wrapped with safeHTML() or trustedTypes
    const innerHTMLAssignments = [...js.matchAll(/\.innerHTML\s*=/g)];
    // If any exist, they must all be preceded by safeHTML( on the same line
    for (const match of innerHTMLAssignments) {
      const lineStart = js.lastIndexOf('\n', match.index) + 1;
      const lineEnd = js.indexOf('\n', match.index);
      const line = js.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
      expect(line).toMatch(/safeHTML\s*\(|trustedTypes/);
    }
  });
});

describe('PWA manifest (task #441)', () => {
  it('manifest.webmanifest exists', () => {
    expect(existsSync(join(root, 'manifest.webmanifest'))).toBe(true);
  });

  it('manifest.webmanifest is valid JSON with required fields', () => {
    const raw = readFileSync(join(root, 'manifest.webmanifest'), 'utf8');
    const m = JSON.parse(raw);
    expect(m.name).toBeTruthy();
    expect(m.theme_color).toBeTruthy();
    expect(m.start_url).toBeTruthy();
    expect(m.display).toBeTruthy();
    expect(Array.isArray(m.icons)).toBe(true);
    expect(m.icons.length).toBeGreaterThan(0);
  });

  it('index.html links to manifest', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    expect(html).toContain('rel="manifest"');
  });

  it('index.html has theme-color meta', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    expect(html).toContain('name="theme-color"');
  });

  it('index.html has skip-link', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    expect(html).toContain('class="skip-link"');
  });

  it('index.html has <main id="main">', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    expect(html).toContain('<main id="main">');
  });
});
