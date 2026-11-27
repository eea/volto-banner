/**
 * Release notes produced by the release-notes agent (eea/release-notes-agent).
 *
 * The agent commits MANIFEST.json and RELEASE_NOTES.md into the frontend helm
 * chart (release-notes/); the chart mounts them read-only into the Volto
 * container and points RELEASE_NOTES_DIR at that folder.
 *
 * Server-side only (uses fs): load it with require() inside `if (__SERVER__)`
 * so it never ends up in the browser bundle.
 *
 * Only the release version and a short plain-text summary leave this module:
 * the rest of the manifest (commits, authors, changed files) and the technical
 * section of the notes are never exposed.
 */
import fs from 'fs';
import path from 'path';
import { RELEASE_NOTES_PATH } from '../constants';

export const RELEASE_NOTES_DIR_ENV = 'RELEASE_NOTES_DIR';
export const MANIFEST_FILE = 'MANIFEST.json';
export const NOTES_FILE = 'RELEASE_NOTES.md';
export const MANIFEST_SCHEMA_PREFIX = 'release-notes-agent/manifest/';

export const MAX_FILE_BYTES = 512 * 1024;
export const MAX_RELEASE_LENGTH = 64;
export const MAX_SUMMARY_LENGTH = 500;

const cache = { key: null, value: null };

export const resetCache = () => {
  cache.key = null;
  cache.value = null;
};

/** Strip HTML tags and inline markdown, collapse whitespace. */
export function toPlainText(markdown) {
  return String(markdown || '')
    .replace(/<[^>]*>/g, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__|\*|_|~~)(.+?)\1/g, '$2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+([.,;:!?])/g, '$1');
}

/** Cut text to `limit` characters on a word boundary. */
export function truncate(text, limit = MAX_SUMMARY_LENGTH) {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');
  const words = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return `${words.replace(/[ ,;:-]+$/, '')}…`;
}

/**
 * The plain-language summary right after the title of RELEASE_NOTES.md.
 *
 * The agent writes "# Release notes - <release>", then a 1-3 sentence
 * summary, then "## What's new". Reading stops at the first second-level
 * heading, so "What's new" and "Technical detail" never leak, even when the
 * summary is missing.
 */
export function extractSummary(notesMd) {
  const lines = [];
  for (const line of String(notesMd || '').split(/\r?\n/)) {
    const stripped = line.trim();
    if (stripped.startsWith('##')) break;
    if (stripped.startsWith('#')) {
      if (lines.length) break;
      continue;
    }
    if (!stripped || /^(-|\*|>|\||```)/.test(stripped)) continue;
    lines.push(stripped);
  }
  return truncate(toPlainText(lines.join(' ')));
}

function readSmall(file) {
  if (fs.statSync(file).size > MAX_FILE_BYTES) {
    throw new Error(`${file} is larger than ${MAX_FILE_BYTES} bytes`);
  }
  return fs.readFileSync(file, 'utf8');
}

function statKey(folder) {
  return [MANIFEST_FILE, NOTES_FILE].map((name) => {
    try {
      const st = fs.statSync(path.join(folder, name));
      return `${st.mtimeMs}:${st.size}:${st.ino}`;
    } catch (e) {
      return null;
    }
  });
}

/** Returns { release, summary } or null when the files are unusable. */
export function parseReleaseNotes(folder) {
  let manifest;
  try {
    manifest = JSON.parse(readSmall(path.join(folder, MANIFEST_FILE)));
  } catch (e) {
    return null;
  }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return null;
  }
  const { schema } = manifest;
  if (typeof schema !== 'string' || !schema.startsWith(MANIFEST_SCHEMA_PREFIX))
    return null;
  if (typeof manifest.release !== 'string') return null;
  const release = toPlainText(manifest.release);
  if (!release || release.length > MAX_RELEASE_LENGTH) return null;

  let summary = '';
  try {
    summary = extractSummary(readSmall(path.join(folder, NOTES_FILE)));
  } catch (e) {
    summary = '';
  }
  return { release, summary };
}

/**
 * Release notes from RELEASE_NOTES_DIR (or `folder`), cached until either
 * file changes. null when not configured, missing or invalid.
 */
export function loadReleaseNotes(folder = process.env[RELEASE_NOTES_DIR_ENV]) {
  if (!folder) return null;
  try {
    if (!fs.statSync(folder).isDirectory()) return null;
  } catch (e) {
    return null;
  }
  const stats = statKey(folder);
  if (stats[0] === null) return null;
  const key = JSON.stringify([folder, ...stats]);
  if (cache.key !== key) {
    cache.value = parseReleaseNotes(folder);
    cache.key = key;
  }
  return cache.value;
}

/** Express router serving { release, summary } for the release banner. */
export function releaseNotesMiddleware(express) {
  const router = express.Router();
  router.get(RELEASE_NOTES_PATH, (req, res) => {
    const notes = loadReleaseNotes();
    res.set('Cache-Control', 'no-store');
    if (!notes) {
      res.status(404).json({});
      return;
    }
    res.json(notes);
  });
  router.id = 'release-notes';
  return router;
}
