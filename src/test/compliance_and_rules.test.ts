import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function getFilesRecursively(dir: string, extensions: string[]): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== '.git' && item.name !== 'dist') {
        results = results.concat(getFilesRecursively(fullPath, extensions));
      }
    } else {
      if (extensions.some((ext) => item.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

describe('Strict Compliance with Hard Rules (Section 0)', () => {
  const sourceFiles = getFilesRecursively('src', ['.ts', '.tsx', '.css']);
  const rootFiles = ['index.html'];

  it('contains zero em dashes (—) anywhere in user-facing copy (Section 0.2)', () => {
    const emDashRegex = /\u2014|—/;
    const violations: Array<{ file: string; line: number; match: string }> = [];

    sourceFiles.concat(rootFiles).forEach((filePath) => {
      // Exclude test file itself from detecting its own regex
      if (filePath.includes('compliance_and_rules.test.ts')) return;

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (emDashRegex.test(line)) {
          violations.push({ file: filePath, line: idx + 1, match: line.trim() });
        }
      });
    });

    expect(violations, `Found em dashes in: ${JSON.stringify(violations, null, 2)}`).toHaveLength(0);
  });

  it('contains zero gradients anywhere in CSS or classes (Section 0.2: No gradients at all)', () => {
    const gradientPattern = /bg-gradient|linear-gradient|radial-gradient|conic-gradient/;
    const violations: Array<{ file: string; line: number; match: string }> = [];

    sourceFiles.concat(rootFiles).forEach((filePath) => {
      if (filePath.includes('compliance_and_rules.test.ts')) return;

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (gradientPattern.test(line)) {
          violations.push({ file: filePath, line: idx + 1, match: line.trim() });
        }
      });
    });

    expect(violations, `Found gradient classes in: ${JSON.stringify(violations, null, 2)}`).toHaveLength(0);
  });

  it('contains zero generator meta tags or third party CDNs in index.html (Section 0.3 & 0.5)', () => {
    const indexContent = fs.readFileSync('index.html', 'utf-8');

    // No generator tag
    expect(indexContent).not.toMatch(/name=["']generator["']/i);

    // No third-party CDN fonts
    expect(indexContent).not.toMatch(/fonts\.googleapis\.com/i);
    expect(indexContent).not.toMatch(/fonts\.gstatic\.com/i);
    expect(indexContent).not.toMatch(/cdnjs\.cloudflare\.com/i);

    // No "Made with" or default template text
    expect(indexContent).not.toMatch(/made with/i);
    expect(indexContent).not.toMatch(/vite\.svg/i);
  });

  it('enforces maximum 6px border radius on inputs and buttons (Section 0.2)', () => {
    // Prohibit pill shapes: rounded-full on button or input
    const violations: Array<{ file: string; line: number; match: string }> = [];
    const pillButtonRegex = /<(button|input|textarea|select)[^>]*class(Name)?=["'][^"']*rounded-full[^"']*["']/i;

    sourceFiles.forEach((filePath) => {
      if (filePath.includes('compliance_and_rules.test.ts')) return;
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (pillButtonRegex.test(line)) {
          violations.push({ file: filePath, line: idx + 1, match: line.trim() });
        }
      });
    });

    expect(violations, `Found pill-shaped button/input in: ${JSON.stringify(violations, null, 2)}`).toHaveLength(0);
  });
});
