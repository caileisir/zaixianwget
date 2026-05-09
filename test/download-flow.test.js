const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const archiveSite = require('../archiver');
const downloadSite = require('../wget');

test('parseDownloadRequest derives the wget output folder from the requested URL', () => {
  const request = downloadSite._internals.parseDownloadRequest('https://example.com/docs/index.html');

  assert.equal(request.url, 'https://example.com/docs/index.html');
  assert.equal(request.folder, 'example.com');
});

test('parseDownloadRequest rejects URLs that wget should not run', () => {
  assert.throws(
    () => downloadSite._internals.parseDownloadRequest('ftp://example.com'),
    /http or https/
  );
  assert.throws(
    () => downloadSite._internals.parseDownloadRequest('not a url'),
    /valid website URL/
  );
});

test('buildArchivePaths refuses an empty downloaded folder name', () => {
  const root = path.join(os.tmpdir(), 'zaixianwget-download-flow-test');

  assert.throws(
    () => archiveSite._internals.buildArchivePaths(root, ''),
    /Downloaded folder name is missing/
  );
});

test('buildArchivePaths writes zips under public/sites', () => {
  const root = path.join(os.tmpdir(), 'zaixianwget-download-flow-test');
  const paths = archiveSite._internals.buildArchivePaths(root, 'example.com');

  assert.equal(paths.sourceDir, path.join(root, 'example.com'));
  assert.equal(paths.outputDir, path.join(root, 'public', 'sites'));
  assert.equal(paths.zipPath, path.join(root, 'public', 'sites', 'example.com.zip'));
});
