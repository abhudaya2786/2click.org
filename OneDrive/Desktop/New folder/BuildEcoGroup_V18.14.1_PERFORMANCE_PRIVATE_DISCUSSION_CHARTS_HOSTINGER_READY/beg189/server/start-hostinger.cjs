const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const serverFile = path.join(process.cwd(), 'dist', 'server.cjs');
if (!fs.existsSync(serverFile)) {
  console.error('[BuildEcoGroup] dist/server.cjs is missing. Running npm run build before start...');
  const r = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { stdio: 'inherit', env: process.env });
  if (r.status !== 0 || !fs.existsSync(serverFile)) {
    console.error('[BuildEcoGroup] Build failed or server bundle is still missing.');
    process.exit(r.status || 1);
  }
}
require(serverFile);
