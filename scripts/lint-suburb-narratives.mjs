#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'content/suburbs');

const BANNED = [
  'exciting', 'thrilled', 'delighted', 'honoured', 'humbled',
  'game-changer', 'game-changing', 'incredible', 'amazing', 'phenomenal',
  'hidden gem', 'tightly held', 'rarely available',
  'seamless', 'robust', 'holistic', 'bespoke', 'curated', 'elevate', 'leverage',
  'transformative', 'impactful', 'innovative', 'disruptive', 'vibrant',
  "I've been thinking", "Something I've noticed", "Let's be honest",
  "Here's the thing", "It's no secret", "In today's market", "As we navigate",
  'Navigating', 'I wanted to share',
  'I am pleased to announce', 'It is with great pleasure',
  'Whether you are', 'feel free to reach out', 'Now more than ever',
  'almost always', 'almost never',
];

const SECTIONS = [
  'transport', 'schools', 'pockets', 'lifestyle',
  'buyer profile', 'selling approach', 'comparable suburbs',
];

function lint(text) {
  const errs = [];
  if (text.includes('\u2014')) errs.push('em-dash');
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/[A-Za-z] - [A-Za-z]/.test(lines[i])) {
      errs.push(`clause-separator-hyphen line ${i + 1}: ${lines[i].trim().slice(0, 80)}`);
      break;
    }
  }
  for (const p of BANNED) {
    const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wrap = /^[a-zA-Z]/.test(p) && /[a-zA-Z]$/.test(p);
    const re = new RegExp(wrap ? `\\b${escaped}\\b` : escaped, 'i');
    if (re.test(text)) errs.push(`banned: "${p}"`);
  }
  for (const s of SECTIONS) {
    if (!text.includes(`## section: ${s}`)) errs.push(`missing section: "${s}"`);
  }
  if (/\$[\d,]+/.test(text)) errs.push('dollar figure');
  if (/\b\d+(?:\.\d+)?\s*%/.test(text)) errs.push('percentage');
  return errs;
}

function main() {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('-narrative.md'));
  const fails = {};
  for (const file of files) {
    const text = fs.readFileSync(path.join(DIR, file), 'utf8');
    const errs = lint(text);
    if (errs.length) fails[file] = errs;
  }
  const total = files.length;
  const failedCount = Object.keys(fails).length;
  console.log(`Linted ${total} narrative files. ${total - failedCount} passed, ${failedCount} failed.`);
  if (failedCount) {
    console.log('');
    for (const [file, errs] of Object.entries(fails)) {
      console.log(`✗ ${file}`);
      for (const e of errs) console.log(`    ${e}`);
    }
    process.exit(1);
  }
  console.log('All narratives passed lint.');
}

main();
