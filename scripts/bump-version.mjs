import fs from 'node:fs/promises';
import path from 'node:path';

const PKG_PATH = path.resolve('package.json');
const META_PATH = path.resolve('src', 'build-meta.json');

function bumpPatch(version) {
  const match = String(version || '1.0.0').trim().match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);
  if (!match) {
    return '1.0.1';
  }
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]) + 1;
  const suffix = match[4] || '';
  return `${major}.${minor}.${patch}${suffix}`;
}

async function main() {
  const pkgRaw = await fs.readFile(PKG_PATH, 'utf8');
  const pkg = JSON.parse(pkgRaw);
  const nextVersion = bumpPatch(pkg.version);
  pkg.version = nextVersion;

  const epoch = Math.floor(Date.now() / 1000);
  const epochMod10000 = String(epoch % 10000).padStart(4, '0');
  const meta = {
    version: nextVersion,
    epoch,
    epochMod10000,
    builtAt: new Date(epoch * 1000).toISOString(),
  };

  await fs.writeFile(PKG_PATH, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  await fs.writeFile(META_PATH, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  console.log(`[bump-version] v${nextVersion} (Linux Epoch: ${epoch}, %10000: ${epochMod10000})`);
}

main().catch((err) => {
  console.error('[bump-version] Error:', err);
  process.exit(1);
});
