/* eslint-disable import/no-commonjs, @typescript-eslint/no-var-requires */
// Node.js script to generate a list of all public files and API endpoints for service worker caching
const fg = require('fast-glob');
const fs = require('fs');
const path = require('path');

const PUBLIC_GLOB = 'public/**/*.*'; // All files in public
const API_GLOB = 'app/api/**/route.ts'; // All API endpoints, including nested
const OUTPUT_FILE = 'public/cache.json';

(async () => {
  // Find all public files (excluding service-worker.js and cache.json itself)
  const files = await fg([PUBLIC_GLOB], { dot: false });
  const filtered = files.filter(f =>
    !f.endsWith('service-worker.js') &&
    !f.endsWith('cache.json')
  );
  // Convert to web-accessible paths
  const webPaths = filtered.map(f => '/' + path.relative('public', f).replace(/\\/g, '/'));

  // Find all API endpoints
  const apiFiles = await fg([API_GLOB], { dot: false });
  const apiEndpoints = apiFiles.map(f => {
    const match = f.match(/app\/api\/(.*?)\/route\.ts$/);
    return match ? `/api/${match[1]}` : null;
  }).filter(Boolean);

  // Write to output file
  const cacheEntries = Array.from(
    new Set(['/'].concat(webPaths, apiEndpoints)),
  );
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cacheEntries, null, 2));
  console.log(`Public file and API cache list written to ${OUTPUT_FILE}`);
})();
