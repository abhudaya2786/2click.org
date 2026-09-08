/**
 * Linux-safe import resolution check (case-sensitive paths).
 * Run before production build: npm run verify:imports
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..', '..');
const SRC = path.join(ROOT, 'src');

const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'];

const IMPORT_RE = /(?:import|export)\s+(?:[^'";]+\s+from\s+)?['"](\.[^'"]+)['"]/g;
const DYNAMIC_IMPORT_RE = /import\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g;

const CRITICAL_FILES = [
  'src/components/auth/ProtectedRoute.tsx',
  'src/components/auth/RoleBadge.tsx',
  'src/contexts/AuthContext.tsx',
  'src/lib/permissions.ts',
  'src/types/auth.ts',
];

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function resolveImport(fromFile: string, spec: string): string | null {
  const base = path.resolve(path.dirname(fromFile), spec);
  const assetExts = ['.css', '.scss', '.json'];
  const candidates = [
    base,
    ...EXTENSIONS.map((ext) => (ext.startsWith('/') ? base + ext : base + ext)),
    ...assetExts.map((ext) => base + ext),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** Verify each path segment matches exact on-disk casing (Linux-safe). */
function hasExactCasePath(absPath: string): boolean {
  if (!fs.existsSync(absPath)) return false;
  const relative = path.relative(ROOT, absPath);
  const segments = relative.split(path.sep);
  let current = ROOT;
  for (const segment of segments) {
    if (!fs.existsSync(current)) return false;
    const entries = fs.readdirSync(current);
    if (!entries.includes(segment)) return false;
    current = path.join(current, segment);
  }
  return true;
}

const missingCritical: string[] = [];
for (const rel of CRITICAL_FILES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    missingCritical.push(rel);
    continue;
  }
  if (!hasExactCasePath(abs)) {
    missingCritical.push(`${rel} (case mismatch on disk)`);
  }
}

const sourceFiles = walk(SRC);
const unresolved: string[] = [];
const caseMismatches: string[] = [];

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const specs = new Set<string>();
  for (const re of [IMPORT_RE, DYNAMIC_IMPORT_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content))) specs.add(m[1]);
  }

  for (const spec of specs) {
    if (!spec.startsWith('.')) continue;
    const resolved = resolveImport(file, spec);
    if (!resolved) {
      unresolved.push(`${path.relative(ROOT, file)} → cannot resolve "${spec}"`);
      continue;
    }
    if (!hasExactCasePath(resolved)) {
      caseMismatches.push(
        `${path.relative(ROOT, file)} → case mismatch for "${spec}" (found: ${path.relative(ROOT, resolved)})`
      );
    }
  }
}

console.log('=== Source Import Verification (Linux-safe) ===\n');

let failed = false;

if (missingCritical.length) {
  failed = true;
  console.error('CRITICAL DEPLOYMENT FILES MISSING:');
  missingCritical.forEach((f) => console.error(`  ✗ ${f}`));
  console.error('');
}

if (unresolved.length) {
  failed = true;
  console.error(`UNRESOLVED IMPORTS (${unresolved.length}):`);
  unresolved.slice(0, 30).forEach((f) => console.error(`  ✗ ${f}`));
  if (unresolved.length > 30) console.error(`  ... and ${unresolved.length - 30} more`);
  console.error('');
}

if (caseMismatches.length) {
  failed = true;
  console.error(`CASE MISMATCHES (${caseMismatches.length}):`);
  caseMismatches.slice(0, 30).forEach((f) => console.error(`  ✗ ${f}`));
  if (caseMismatches.length > 30) console.error(`  ... and ${caseMismatches.length - 30} more`);
  console.error('');
}

if (failed) {
  console.error('Import verification FAILED — Hostinger Linux build will fail.');
  process.exit(1);
}

console.log(`✓ ${sourceFiles.length} source files scanned`);
console.log(`✓ ${CRITICAL_FILES.length} critical deployment files present`);
console.log('✓ All relative imports resolve with exact Linux-safe casing');
