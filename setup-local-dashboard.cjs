#!/usr/bin/env node
/**
 * setup-local-dashboard.js
 * Finds the running PaperclipAI installation and copies agent-dashboard.html
 * into its static files directory so it's served at:
 *   http://127.0.0.1:3100/agent-dashboard.html
 *
 * Run: node setup-local-dashboard.js
 *   or: npm run local-dashboard
 */
const { execSync } = require('child_process');
const { copyFileSync, existsSync } = require('fs');
const path = require('path');

const SRC  = path.join(__dirname, 'agent-dashboard.html');
const DEST = 'agent-dashboard.html';
const URL  = 'http://127.0.0.1:3100/agent-dashboard.html';

// ── Find PaperclipAI's ui-dist directory ─────────────────────────────────
function findUiDist() {
  // Strategy 1: look at the running process
  try {
    const ps = execSync('ps aux', { encoding: 'utf-8' });
    const match = ps.match(/node\s+(\/[^\s]*\/node_modules\/[^\s]*paperclipai[^\s]*)/i);
    if (match) {
      const scriptPath = match[1];
      // Walk up to node_modules root
      const nmIdx = scriptPath.lastIndexOf('/node_modules/');
      if (nmIdx !== -1) {
        const nmRoot = scriptPath.slice(0, nmIdx + '/node_modules'.length);
        const candidate = path.join(nmRoot, '@paperclipai', 'server', 'ui-dist');
        if (existsSync(path.join(candidate, 'index.html'))) return candidate;
      }
    }
  } catch {}

  // Strategy 2: resolve from the npx cache using require
  try {
    const serverPkg = require.resolve('@paperclipai/server/package.json', {
      paths: [
        path.join(process.env.HOME || '', '.npm', '_npx'),
        '/usr/local/lib/node_modules',
        path.join(process.env.HOME || '', '.npm', 'node_modules'),
      ]
    });
    const candidate = path.join(path.dirname(serverPkg), 'ui-dist');
    if (existsSync(path.join(candidate, 'index.html'))) return candidate;
  } catch {}

  // Strategy 3: glob for ui-dist under .npm cache
  try {
    const out = execSync(
      `find "${process.env.HOME}/.npm/_npx" -name "ui-dist" -path "*/@paperclipai/server/ui-dist" 2>/dev/null | head -1`,
      { encoding: 'utf-8' }
    ).trim();
    if (out && existsSync(path.join(out, 'index.html'))) return out;
  } catch {}

  return null;
}

const uiDist = findUiDist();

if (!uiDist) {
  console.error('\n❌  Could not locate PaperclipAI ui-dist.\n');
  console.error('    Make sure PaperclipAI is running (npm exec paperclipai onboard --yes)');
  console.error('    then try again.\n');
  process.exit(1);
}

const dest = path.join(uiDist, DEST);
copyFileSync(SRC, dest);

console.log('\n✓  Dashboard installed successfully.\n');
console.log(`   Location : ${dest}`);
console.log(`   Open at  : ${URL}\n`);

// Try to open in browser
try {
  execSync(`open "${URL}"`);
  console.log('   Browser opening...\n');
} catch {}
