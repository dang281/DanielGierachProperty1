#!/usr/bin/env node
/**
 * setup-local-dashboard.cjs
 * Copies agent-dashboard.html into PaperclipAI's static file directory and
 * generates social-data.json from content/social/*.md so the dashboard can
 * render social posts without needing filesystem access.
 *
 * Run: node setup-local-dashboard.cjs
 *   or: npm run local-dashboard
 */
const { execSync } = require('child_process');
const { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } = require('fs');
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

// ── Copy dashboard HTML ───────────────────────────────────────────────────
const dest = path.join(uiDist, DEST);
copyFileSync(SRC, dest);
console.log('\n✓  Dashboard installed successfully.');
console.log(`   Location : ${dest}`);

// ── Generate social-data.json ─────────────────────────────────────────────
const AVATAR = 'https://cdn6.ep.dynamics.net/s3/rw-media/memberphotos/88889915-cef5-4a5f-9c19-0cea700d7bca.jpeg';

function parseSocialFile(filename, raw) {
  const titleMatch   = raw.match(/^#\s+(.+)/m);
  const platformMatch = raw.match(/\*\*Platform:\*\*\s*(.+)/i);
  const formatMatch  = raw.match(/\*\*Format:\*\*\s*(.+)/i);
  const goalMatch    = raw.match(/\*\*Goal:\*\*\s*(.+)/i);
  const publishMatch = raw.match(/\*\*Publish date:\*\*\s*(.+)/i);
  const statusMatch  = raw.match(/\*\*Status:\*\*\s*(.+)/i);
  const pillarMatch  = raw.match(/\*\*Content Pillar:\*\*\s*(.+)/i);
  const timeMatch    = raw.match(/\*\*Scheduled time:\*\*\s*(.+)/i);
  const scoreMatch   = raw.match(/\*\*Score:\*\*\s*(.+)/i);
  const captionMatch = raw.match(/## Caption\s+([\s\S]+?)(?=\n## |\n---|\s*$)/i);
  const hashtagMatch = raw.match(/## Hashtags\s+([\s\S]+?)(?=\n## |\n---|\s*$)/i);
  const notesMatch   = raw.match(/## Notes for Daniel\s+([\s\S]+?)(?=\n## |\s*$)/i);
  const pollMatch    = raw.match(/## Poll options[\s\S]*?\n((?:- .+\n?)+)/i);

  const dateFromFile = filename.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || '';
  const dateFormatted = dateFromFile
    ? new Date(dateFromFile + 'T12:00:00').toLocaleDateString('en-AU', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
      })
    : '';

  const platformRaw  = platformMatch?.[1]?.trim() || 'Social';
  const p            = platformRaw.toLowerCase();
  const platformNorm = p.includes('instagram') ? 'instagram'
                     : p.includes('facebook')  ? 'facebook'
                     : p.includes('linkedin')  ? 'linkedin'
                     : 'other';

  // Normalise status value
  const statusRaw = statusMatch?.[1]?.trim() || '';
  const statusNorm = statusRaw.toLowerCase().replace(/\s+/g, '_');
  const statusMap  = { idea:'idea', ready_for_review:'ready_for_review', scheduled:'scheduled', posted:'posted', rejected:'rejected' };
  // Default: if publishDate set → ready_for_review, else → idea
  const statusDefault = (publishMatch?.[1]?.trim() || dateFromFile) ? 'ready_for_review' : 'idea';
  const status = statusMap[statusNorm] || statusDefault;

  return {
    filename,
    platform: platformRaw,
    platformNorm,
    title:         titleMatch?.[1]?.trim()    || filename.replace('.md', ''),
    date:          dateFormatted,
    publishDate:   publishMatch?.[1]?.trim()  || dateFromFile,
    scheduledTime: timeMatch?.[1]?.trim()     || '',
    status,
    contentPillar: pillarMatch?.[1]?.trim()   || '',
    score:         scoreMatch?.[1]?.trim()    || '',
    body:          captionMatch?.[1]?.trim()  || raw.slice(0, 600),
    hashtags:      hashtagMatch?.[1]?.trim()  || '',
    notes:         notesMatch?.[1]?.trim()    || '',
    goal:          goalMatch?.[1]?.trim()     || '',
    format:        formatMatch?.[1]?.trim()   || '',
    pollOptions: pollMatch ? pollMatch[1].trim().split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean) : [],
    avatar: AVATAR,
  };
}

const socialDir = path.join(__dirname, 'content', 'social');
let drafts = [];
try {
  const files = readdirSync(socialDir)
    .filter(f => f.endsWith('.md') && f !== '.gitkeep')
    .sort((a, b) => b.localeCompare(a)); // newest first
  drafts = files.map(f => parseSocialFile(f, readFileSync(path.join(socialDir, f), 'utf-8')));
} catch (e) {
  // No social content yet — write empty array
}

const jsonPath = path.join(uiDist, 'social-data.json');
writeFileSync(jsonPath, JSON.stringify(drafts, null, 2));
console.log(`✓  social-data.json written (${drafts.length} post${drafts.length !== 1 ? 's' : ''})`);
console.log(`   Open at  : ${URL}\n`);

// Try to open in browser
try {
  execSync(`open "${URL}"`);
  console.log('   Browser opening...\n');
} catch {}
