import path from 'node:path';

// 1. Lokasi Berkas & Ekstraksi Komponen
console.log('--- 1. Komponen Path Berkas ---');
const currentFile = import.meta.filename;
console.log({
  file: currentFile,
  dir: path.dirname(currentFile),
  base: path.basename(currentFile),
  nameOnly: path.basename(currentFile, path.extname(currentFile)),
  ext: path.extname(currentFile),
});

// 2. Penggabungan & Resolusi (join vs resolve)
console.log('\n--- 2. path.join vs path.resolve ---');
console.log({
  joined: path.join('/app', 'src', 'controllers', '..', 'models', 'user.js'),
  resolvedRelative: path.resolve('data', 'config.json'), // process.cwd() + path.resolve()
  resolvedReset: path.resolve('folderA', '/folderB', 'file.txt'), // / artinya reset root
});

// 3. Jarak Relatif & Normalisasi
console.log('\n--- 3. path.relative & path.normalize ---');
console.log({
  relativeRoute: path.relative(
    '/app/src/controllers',
    '/app/assets/images/logo.png',
  ),
  normalizedMessy: path.normalize('/var//log/../log/audit//app.log'),
  isAbsolute: path.isAbsolute(currentFile),
});

// 4. Bedah & Rakit Objek Path (parse & format)
console.log('\n--- 4. path.parse & path.format ---');
const parsed = path.parse(currentFile);
const backupPath = path.format({
  ...parsed,
  base: undefined,
  ext: '.backup.mjs',
});
console.log({
  parsed,
  formattedBackup: backupPath,
});

// 5. Standar Lintas OS (sep, posix, win32)
console.log('\n--- 5. Lintas Platform (sep, posix, win32) ---');
const winSample = 'C:\\Users\\John\\Documents\\report.pdf';
const win32ToPosix = winSample.split(path.win32.sep).join(path.posix.sep);

console.log({
  systemSep: path.sep,
  s3CloudKey: path.posix.join('uploads', '2026', 'photo.png'),
  winExtractedBase: path.win32.basename(winSample),
  winExtractedDir: path.win32.dirname(winSample),
  win32ToPosix,
});

// 6. Pola Keamanan: Mencegah Path Traversal
console.log('\n--- 6. Uji Keamanan Path Traversal ---');
function checkPathSafety(rootDir, userInput) {
  const safeTarget = path.resolve(rootDir, '.' + path.sep + userInput);
  return {
    input: userInput,
    safeTarget,
    isSafe: safeTarget.startsWith(rootDir),
  };
}

const ROOT = '/var/www/public';
console.log({
  validAccess: checkPathSafety(ROOT, 'images/banner.png'),
  traversalAttack: checkPathSafety(ROOT, '../../etc/passwd'),
});
