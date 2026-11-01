import fs from 'node:fs/promises';
import path from 'node:path';

// SOAL 1
async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
  return true;
}

const testDirPat = path.join(import.meta.dirname, 'data', 'reports', '2026');
console.log(await ensureDirectory(testDirPat));

// SOAL 2
async function getDirectoryStats(dirPath) {
  const dirStat = await fs.stat(dirPath);

  if (!dirStat.isDirectory()) {
    throw new Error('Path bukan folder');
  }

  const entries = await fs.readdir(path.join(dirPath), {
    withFileTypes: true,
  });

  let totalFiles = 0;
  let totalDirectories = 0;
  let totalSizeBytes = 0;

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      totalDirectories++;
    } else if (entry.isFile()) {
      totalFiles++;
      const stat = await fs.stat(fullPath);
      totalSizeBytes += stat.size;
    }
  }

  return {
    totalFiles,
    totalDirectories,
    totalSizeBytes,
  };
}

const dir = path.join(import.meta.dirname, 'data');
console.log(await getDirectoryStats(dir));

try {
  await getDirectoryStats('data/temp.txt');
} catch (error) {
  console.log(error.message);
  // Output: Target path is not a directory
}

// SOAL 3
async function cleanExpiredArchives(dirPath, maxAgeSeconds) {
  try {
    let deletedCount = 0;
    let deletedFiles = [];

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const stat = await fs.stat(path.join(dirPath, entry.name));
        if ((Date.now() - stat.mtimeMs) / 1000 > maxAgeSeconds) {
          deletedCount++;
          deletedFiles.push(entry.name);
          await fs.unlink(path.join(dirPath, entry.name));
        }
      }
    }

    return {
      success: true,
      deletedCount,
      deletedFiles,
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        success: false,
        reason: 'Directory not found',
        deletedCount: 0,
        deletedFiles: [],
      };
    }
    throw error;
  }
}

// await fs.mkdir(path.join(import.meta.dirname, 'data', 'archives'));
// await fs.mkdir(
//   path.join(import.meta.dirname, 'data', 'archives', 'sub-archives'),
// );
await Promise.all([
  fs.writeFile(
    path.join(import.meta.dirname, 'data', 'archives', 'audit-old.log'),
    'LOG-1',
    'utf-8',
  ),
  fs.writeFile(
    path.join(import.meta.dirname, 'data', 'archives', 'session-expired.txt'),
    'SESSION-1',
    'utf-8',
  ),
]);

console.log(
  await cleanExpiredArchives(
    path.join(import.meta.dirname, 'data', 'archives'),
    10,
  ),
);
