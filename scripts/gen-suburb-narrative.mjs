#!/usr/bin/env node
/**
 * Generates the deep-dive narrative markdown for a suburb.
 *
 *   ANTHROPIC_API_KEY=sk-... node scripts/gen-suburb-narrative.mjs murarrie
 *   ANTHROPIC_API_KEY=sk-... node scripts/gen-suburb-narrative.mjs murarrie seven-hills bulimba
 *
 * Reads:
 *   content/suburbs/{slug}.json           (Daniel-authored facts)
 *   content/daniel-voice-calibration.md   (voice rules)
 *   CLAUDE.md                             (banned phrases, em-dash rule)
 *
 * Writes:
 *   content/suburbs/{slug}-narrative.md
 *
 * Lint pass after generation hard-fails on em-dashes, clause-separator
 * hyphens, or any banned phrase from CLAUDE.md. Run again after fixing.
 *
 * Uses Claude Sonnet 4.6 with prompt caching on the system prompt
 * (voice cal + banned phrases) so each additional suburb is cheap.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const MODEL = 'claude-sonnet-4-6';
const API_URL = 'https://api.anthropic.com/v1/messages';
const MAX_TOKENS = 4000;

const BANNED_PHRASES = [
  // Hype and filler
  'exciting', 'thrilled', 'delighted', 'honoured', 'humbled',
  'game-changer', 'game-changing', 'incredible', 'amazing', 'phenomenal',
  'hidden gem', 'tightly held', 'rarely available',
  'seamless', 'robust', 'holistic', 'bespoke', 'curated', 'elevate', 'leverage',
  'transformative', 'impactful', 'innovative', 'disruptive', 'vibrant',
  // Opener clichés
  "I've been thinking", "Something I've noticed", "Let's be honest",
  "Here's the thing", "It's no secret", "In today's market", "As we navigate",
  'Navigating', 'I wanted to share',
  // Agent clichés
  'I am pleased to announce', 'It is with great pleasure',
  'Whether you are', 'feel free to reach out', 'Now more than ever',
  // Definitive claims
  'almost always', 'almost never',
];

const SECTIONS = [
  'transport',
  'schools',
  'pockets',
  'lifestyle',
  'buyer profile',
  'selling approach',
  'comparable suburbs',
];

function readFile(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function loadVoiceCalibration() {
  return readFile('content/daniel-voice-calibration.md');
}

function loadClaudeMdBannedSection() {
  const claudeMd = readFile('CLAUDE.md');
  const start = claudeMd.indexOf('## WRITING \u2014 WHAT IS BANNED');
  const end = claudeMd.indexOf('---', start);
  return claudeMd.slice(start, end > 0 ? end : start + 5000);
}

function loadSuburbData(slug) {
  const file = path.join(ROOT, 'content/suburbs', `${slug}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(
      `Missing data file: content/suburbs/${slug}.json\n` +
      `Author the suburb data file before generating the narrative. ` +
      `See content/suburbs/murarrie.json for the canonical shape.`
    );
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function buildSystemPrompt(voiceCal, bannedSection) {
  return [
    {
      type: 'text',
      text: `You are writing factual suburb deep-dive content for danielgierach.com, the website of Brisbane real estate agent Daniel Gierach. The audience is sellers, buyers, and locals researching the suburb. The content must be factual, voice-calibrated, and free of any AI-writing tells.

# RULES YOU MUST FOLLOW

## NEVER USE
- Em-dashes (the U+2014 character). Use full stops, colons, or commas instead. This is the single most common AI tell.
- Clause-separator hyphens (a hyphen with a space before and after, e.g. " - "). Same rule.
- Specific median prices, dollar figures, growth percentages, or days-on-market numbers. Relational pricing language is fine ("entry point lower than Cannon Hill"). Specific numbers are not, because the licensed source data (PriceFinder) is not available.
- Invented facts. If the suburb data says "verify: true" on a school catchment or bus route, do not state it as fact. Direct readers to the lookup tool instead.

## VOICE
- Calm, precise, direct. Daniel is the most knowledgeable person in the room and does not need to prove it.
- Soften definitive claims. Use "can", "often", "in many cases" rather than "always", "regularly", "almost always".
- Anchor to the inner east. Name surrounding suburbs (Hawthorne, Bulimba, Morningside, Cannon Hill, Camp Hill, Coorparoo) where relevant.
- Specific over generic. Name streets, parks, schools, motorways. "Murarrie Recreation Reserve" beats "a local park". "Hargreaves Street" beats "a quiet street".
- Honest about trade-offs. If a suburb has industrial adjacency, flight path, or another factor, address it directly. Buyers respect the honesty and arrive informed.

## STRUCTURE
Output exactly seven sections in this order, using these markdown headings:

\`\`\`
## section: transport
## section: schools
## section: pockets
## section: lifestyle
## section: buyer profile
## section: selling approach
## section: comparable suburbs
\`\`\`

Each section is 150 to 350 words of plain prose. No bullet lists in the body. No bold mid-sentence. No headings inside sections.

For the transport section: cover trains, buses, driving, and active transport in that order. Always link to translink.com.au/plan-your-journey for live route and timetable lookups. Do not hardcode bus route numbers.

For the schools section: name state primary schools that exist in the suburb. Do not invent catchment boundaries. Direct readers to qgso.qld.gov.au/maps/edmap for catchment lookups. List private school options nearby with a verify caveat where appropriate. End the section with a "⚠️ VERIFY:" line for any catchment-specific facts.

For comparable suburbs: use markdown links in the format [Suburb Name](/suburbs/slug) for each comparable, and explain the trade-off versus the target suburb in 2 to 4 sentences each.

# DANIEL'S VOICE CALIBRATION (read carefully)

${voiceCal}

# BANNED PHRASES AND WRITING PATTERNS (from CLAUDE.md)

${bannedSection}

# OUTPUT FORMAT

Output ONLY the seven sections, starting with "## section: transport". Do not include frontmatter, preamble, or commentary. The script will add frontmatter automatically.`,
      cache_control: { type: 'ephemeral' },
    },
  ];
}

function buildUserMessage(suburbData) {
  return `Write the seven-section suburb deep-dive narrative for the following suburb. Use the data provided as your factual base. Where data has "verify: true" or appears in the verify_flags list, do not state it as fact in your output: instead direct readers to the lookup tool.

\`\`\`json
${JSON.stringify(suburbData, null, 2)}
\`\`\``;
}

async function callClaude(systemPrompt, userMessage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Export it before running:\n' +
      '  export ANTHROPIC_API_KEY=sk-...'
    );
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API error ${res.status}: ${body}`);
  }
  const data = await res.json();
  if (data.usage) {
    const { input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens } = data.usage;
    console.log(
      `  tokens in=${input_tokens} out=${output_tokens}` +
      (cache_read_input_tokens ? ` cache_read=${cache_read_input_tokens}` : '') +
      (cache_creation_input_tokens ? ` cache_create=${cache_creation_input_tokens}` : '')
    );
  }
  return data.content[0].text;
}

function lintNarrative(text, slug) {
  const errors = [];

  const EM_DASH = '\u2014';
  if (text.includes(EM_DASH)) {
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      if (line.includes(EM_DASH)) errors.push(`Line ${i + 1}: em-dash in "${line.trim().slice(0, 80)}..."`);
    });
  }

  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (/[A-Za-z] - [A-Za-z]/.test(line)) {
      errors.push(`Line ${i + 1}: clause-separator hyphen in "${line.trim().slice(0, 80)}..."`);
    }
  });

  for (const phrase of BANNED_PHRASES) {
    const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (re.test(text)) {
      errors.push(`Banned phrase: "${phrase}"`);
    }
  }

  for (const section of SECTIONS) {
    if (!text.includes(`## section: ${section}`)) {
      errors.push(`Missing section heading: "## section: ${section}"`);
    }
  }

  if (/\$[\d,]+/.test(text)) {
    errors.push('Specific dollar figure found (no medians or sale prices allowed)');
  }
  if (/\b\d+(?:\.\d+)?\s*%/.test(text)) {
    errors.push('Specific percentage found (no growth or yield % allowed)');
  }

  return errors;
}

function buildFrontmatter(slug) {
  const today = new Date().toISOString().slice(0, 10);
  return `---\nslug: ${slug}\ngenerated_at: ${today}\nauthored_by: claude-sonnet-4-6\n---\n\n`;
}

async function generateSuburb(slug, systemPrompt) {
  console.log(`\n→ ${slug}`);
  const data = loadSuburbData(slug);
  const userMessage = buildUserMessage(data);
  const narrative = await callClaude(systemPrompt, userMessage);

  const errors = lintNarrative(narrative, slug);
  if (errors.length > 0) {
    console.error(`✗ Lint failed for ${slug}:`);
    errors.forEach((e) => console.error(`  - ${e}`));
    const failPath = path.join(ROOT, 'content/suburbs', `${slug}-narrative.FAILED.md`);
    fs.writeFileSync(failPath, buildFrontmatter(slug) + narrative);
    console.error(`  Output saved to ${failPath} for inspection. Re-run after fixing the prompt or data.`);
    return false;
  }

  const outPath = path.join(ROOT, 'content/suburbs', `${slug}-narrative.md`);
  fs.writeFileSync(outPath, buildFrontmatter(slug) + narrative);
  console.log(`✓ ${outPath}`);
  return true;
}

async function main() {
  const slugs = process.argv.slice(2);
  if (slugs.length === 0) {
    console.error('Usage: node scripts/gen-suburb-narrative.mjs <slug> [<slug>...]');
    console.error('Example: node scripts/gen-suburb-narrative.mjs seven-hills bulimba');
    process.exit(1);
  }

  const voiceCal = loadVoiceCalibration();
  const bannedSection = loadClaudeMdBannedSection();
  const systemPrompt = buildSystemPrompt(voiceCal, bannedSection);

  let ok = 0;
  let failed = 0;
  for (const slug of slugs) {
    try {
      const success = await generateSuburb(slug, systemPrompt);
      if (success) ok++;
      else failed++;
    } catch (err) {
      console.error(`✗ ${slug}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. ${ok} ok, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main();
