import fs from 'node:fs';
import path from 'node:path';

const isStrict = process.argv.includes('--strict') || process.env.STRICT_PLACEHOLDERS === 'true';

const TARGET_DIRS = ['src'];
const TARGET_FILES = ['index.html'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.html', '.css'];

// Single clean pattern matching all placeholders
const COMBINED_PATTERN = /\[\[[A-Z0-9_]+:[^\]]+\]\]|Photo to be added/g;

const found = [];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const matches = line.match(COMBINED_PATTERN);
    if (matches) {
      matches.forEach((match) => {
        found.push({
          file: filePath,
          line: index + 1,
          match: match.trim(),
          context: line.trim(),
        });
      });
    }
  });
}

function scanDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        scanDir(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (EXTENSIONS.includes(ext)) {
        checkFile(fullPath);
      }
    }
  }
}

// Scan target dirs
for (const dir of TARGET_DIRS) {
  scanDir(dir);
}
// Scan root files
for (const file of TARGET_FILES) {
  if (fs.existsSync(file)) {
    checkFile(file);
  }
}

// Check dist if exists
if (fs.existsSync('dist')) {
  scanDir('dist');
}

console.log('--- Placeholder Audit Report ---');
if (found.length === 0) {
  console.log('No pending client placeholders or photo placeholders found.');
  process.exit(0);
} else {
  console.log(`Found ${found.length} placeholder occurrences:`);
  found.forEach((item, idx) => {
    console.log(`  ${idx + 1}. [${item.file}:${item.line}] ${item.match}`);
    console.log(`     Snippet: ${item.context}`);
  });

  if (isStrict) {
    console.error('\nERROR: Placeholders detected in strict/production mode! Build blocked per Section 9.');
    process.exit(1);
  } else {
    console.log('\nAudit complete (dev mode: reported pending client items). Pass --strict to block build.');
    process.exit(0);
  }
}
