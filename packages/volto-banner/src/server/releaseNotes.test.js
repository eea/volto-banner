import fs from 'fs';
import os from 'os';
import path from 'path';
import { vi } from 'vitest';
import {
  MANIFEST_FILE,
  MAX_FILE_BYTES,
  MAX_SUMMARY_LENGTH,
  NOTES_FILE,
  RELEASE_NOTES_DIR_ENV,
  extractSummary,
  loadReleaseNotes,
  releaseNotesMiddleware,
  resetCache,
  toPlainText,
  truncate,
} from './releaseNotes';

const NOTES = `# Release notes - v2.5.0

Search is faster and maps load in half the time.
Editors can now schedule publication.

## What's new
### Improved
- Faster search

## Technical detail
- abc1234 bump plone.restapi
`;

const manifest = (
  release = 'v2.5.0',
  schema = 'release-notes-agent/manifest/v1',
) =>
  JSON.stringify({
    schema,
    release,
    packages: [{ name: 'backend', commits: [{ author: 'x' }] }],
  });

describe('toPlainText / truncate', () => {
  it('strips HTML tags', () => {
    expect(
      toPlainText('Hi <script>alert(1)</script><img src=x onerror=y>!'),
    ).toBe('Hi alert(1)!');
  });

  it('strips inline markdown', () => {
    expect(
      toPlainText('**Bold** _em_ `code` [link](http://x) ![i](y.png)'),
    ).toBe('Bold em code link i');
  });

  it('leaves no space before punctuation', () => {
    expect(toPlainText('Done <img src=x> .')).toBe('Done.');
  });

  it('truncates on a word boundary', () => {
    expect(truncate('one two three four', 10)).toBe('one two…');
    expect(truncate('short', 10)).toBe('short');
  });
});

describe('extractSummary', () => {
  it('takes the paragraph after the title', () => {
    expect(extractSummary(NOTES)).toBe(
      'Search is faster and maps load in half the time. ' +
        'Editors can now schedule publication.',
    );
  });

  it('never reads past a second-level heading', () => {
    expect(
      extractSummary(
        "# Release notes - v1\n\n## What's new\n- a\n\n## Technical detail\nsecret internal text\n",
      ),
    ).toBe('');
  });

  it('skips lists before the summary', () => {
    expect(extractSummary('# T\n- item\nSummary.\n')).toBe('Summary.');
  });

  it('caps long summaries', () => {
    const summary = extractSummary(`# T\n${'word '.repeat(300)}`);
    expect(summary.length).toBeLessThanOrEqual(MAX_SUMMARY_LENGTH + 1);
    expect(summary.endsWith('…')).toBe(true);
  });

  it('handles empty input', () => {
    expect(extractSummary('')).toBe('');
    expect(extractSummary(undefined)).toBe('');
  });
});

describe('loadReleaseNotes', () => {
  let dir;
  const write = (name, content) =>
    fs.writeFileSync(path.join(dir, name), content, 'utf8');

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-notes-'));
    resetCache();
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    delete process.env[RELEASE_NOTES_DIR_ENV];
  });

  it('reads valid files and returns only release and summary', () => {
    write(MANIFEST_FILE, manifest());
    write(NOTES_FILE, NOTES);
    const notes = loadReleaseNotes(dir);
    expect(notes.release).toBe('v2.5.0');
    expect(notes.summary.startsWith('Search is faster')).toBe(true);
    expect(Object.keys(notes).sort()).toEqual(['release', 'summary']);
  });

  it('reads the folder from RELEASE_NOTES_DIR', () => {
    write(MANIFEST_FILE, manifest());
    process.env[RELEASE_NOTES_DIR_ENV] = dir;
    expect(loadReleaseNotes().release).toBe('v2.5.0');
  });

  it('returns null when not configured or missing', () => {
    expect(loadReleaseNotes(undefined)).toBeNull();
    expect(loadReleaseNotes(path.join(dir, 'nope'))).toBeNull();
    expect(loadReleaseNotes(dir)).toBeNull();
  });

  it('works without RELEASE_NOTES.md', () => {
    write(MANIFEST_FILE, manifest());
    expect(loadReleaseNotes(dir)).toEqual({ release: 'v2.5.0', summary: '' });
  });

  it('rejects invalid manifests', () => {
    [
      '{not json',
      '[]',
      manifest('v1', 'something-else/v1'),
      manifest(''),
      manifest('x'.repeat(100)),
      JSON.stringify({
        schema: 'release-notes-agent/manifest/v1',
        release: 3,
      }),
    ].forEach((content) => {
      resetCache();
      write(MANIFEST_FILE, content);
      expect(loadReleaseNotes(dir)).toBeNull();
    });
  });

  it('returns the release as plain text', () => {
    write(MANIFEST_FILE, manifest('<b>v2</b>'));
    expect(loadReleaseNotes(dir).release).toBe('v2');
  });

  it('refuses files that are too large', () => {
    write(MANIFEST_FILE, manifest());
    write(NOTES_FILE, `# T\nSummary.\n${'x'.repeat(MAX_FILE_BYTES + 10)}`);
    expect(loadReleaseNotes(dir).summary).toBe('');

    resetCache();
    write(MANIFEST_FILE, ' '.repeat(MAX_FILE_BYTES + 10) + manifest());
    expect(loadReleaseNotes(dir)).toBeNull();
  });

  it('follows file changes', () => {
    write(MANIFEST_FILE, manifest('v1'));
    expect(loadReleaseNotes(dir).release).toBe('v1');
    write(MANIFEST_FILE, manifest('v2.0.0'));
    expect(loadReleaseNotes(dir).release).toBe('v2.0.0');
  });
});

describe('releaseNotesMiddleware', () => {
  const fakeExpress = () => {
    const routes = {};
    return {
      routes,
      Router: () => ({
        get: (routePath, handler) => {
          routes[routePath] = handler;
        },
      }),
    };
  };
  const fakeRes = () => {
    const res = { headers: {}, statusCode: 200, body: undefined };
    res.set = (k, v) => {
      res.headers[k] = v;
      return res;
    };
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = vi.fn((body) => {
      res.body = body;
      return res;
    });
    return res;
  };

  let dir;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-notes-'));
    resetCache();
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    delete process.env[RELEASE_NOTES_DIR_ENV];
  });

  it('serves release and summary on /@@release-notes', () => {
    fs.writeFileSync(path.join(dir, MANIFEST_FILE), manifest());
    fs.writeFileSync(path.join(dir, NOTES_FILE), NOTES);
    process.env[RELEASE_NOTES_DIR_ENV] = dir;
    const express = fakeExpress();
    const router = releaseNotesMiddleware(express);
    expect(router.id).toBe('release-notes');

    const res = fakeRes();
    express.routes['/@@release-notes']({}, res);
    expect(res.statusCode).toBe(200);
    expect(res.headers['Cache-Control']).toBe('no-store');
    expect(res.body.release).toBe('v2.5.0');
    expect(JSON.stringify(res.body)).not.toContain('abc1234');
  });

  it('answers 404 without release notes', () => {
    const express = fakeExpress();
    releaseNotesMiddleware(express);
    const res = fakeRes();
    express.routes['/@@release-notes']({}, res);
    expect(res.statusCode).toBe(404);
  });
});
