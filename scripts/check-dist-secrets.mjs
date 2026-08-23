import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'dist');
const KEY_PATTERN = /AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{20,}/g;

async function walk(dir) {
  const entries = await readdir(dir, {withFileTypes: true});
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

const files = await walk(ROOT).catch(() => {
  console.error('dist/ is missing. Run npm run build first.');
  process.exit(1);
});

let failed = false;
for (const file of files) {
  if (!/\.(js|css|html|map|txt)$/.test(file)) {
    continue;
  }
  const text = await readFile(file, 'utf8');
  if (KEY_PATTERN.test(text)) {
    console.error(`Secret-like token found in ${path.relative(process.cwd(), file)}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log('No secret-like tokens found in dist/.');
