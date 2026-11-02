import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

async function safeSave(filePath, data) {
  const dir = path.dirname(filePath);
  const tempPath = path.join(dir, `.tmp-${crypto.randomUUID()}`);

  await fs.writeFile(tempPath, JSON.stringify(data), 'utf8');
  await fs.rename(tempPath, filePath);
}

const target = path.resolve('data.json');
try {
  await safeSave(target, { version: 1, ready: true });
  const readData = JSON.parse(await fs.readFile(target, 'utf8'));
  console.log('Status ready:', readData.ready);
} finally {
  await fs.unlink(target).catch(() => {});
}
