/**
 * 04 - Path Manipulation Demonstration (Industry Standard)
 *
 * Demonstrasi manipulasi path lintas sistem operasi dan proteksi keamanan:
 * 1. Resolusi dinamis berbasis import.meta.url (Tanpa Hardcoded Path)
 * 2. Ekstraksi Komponen (dirname, basename, extname)
 * 3. Parsing & Formatting Objek Path (path.parse & path.format)
 * 4. Perbedaan Kritis: path.join() vs path.resolve()
 * 5. Menghitung Selisih Jalur (path.relative)
 * 6. Explicit Cross-Platform: path.posix vs path.win32
 * 7. Security: Mencegah Kerentanan Path Traversal (Directory Traversal)
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 1. Resolusi Jalur File Dinamis di ES Modules
const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

console.log('=== 1. Ekstraksi Komponen Berkas Dinamis ===');
console.log('File Path Absolut :', currentFile);
console.log('Direktori Induk   :', currentDir);
console.log('Nama File (Base)  :', path.basename(currentFile));
console.log(
  'Nama Tanpa Ext    :',
  path.basename(currentFile, path.extname(currentFile)),
);
console.log('Ekstensi File     :', path.extname(currentFile));

console.log('\n=== 2. Parsing dan Formatting Objek Path ===');
const parsed = path.parse(currentFile);
console.log('Hasil path.parse() :');
console.table(parsed);

// Memodifikasi ekstensi lalu mengembalikan ke string via path.format
const modifiedPath = path.format({
  ...parsed,
  base: undefined, // Wajib di-undefined agar format menggunakan 'name' dan 'ext' baru
  ext: '.backup.js',
});
console.log('Hasil Modifikasi path.format():', modifiedPath);

console.log('\n=== 3. Perbedaan Kritis: path.join() vs path.resolve() ===');
// path.join hanya menempelkan segmen dan merapikan titik
const joined = path.join(
  '/var/www',
  'uploads',
  '..',
  'documents',
  'laporan.pdf',
);
console.log('path.join()   :', joined);
// Output: '/var/www/documents/laporan.pdf'

// path.resolve bertindak layaknya perintah 'cd' di terminal hingga menjadi absolut
const resolved = path.resolve('data', 'config.json');
console.log('path.resolve():', resolved);
// Output: path absolut dari current working directory

console.log('\n=== 4. Menghitung Selisih Jalur Relatif (path.relative) ===');
const fromDir = '/home/project/src/controllers';
const toTarget = '/home/project/assets/images/logo.png';
const relativeGap = path.relative(fromDir, toTarget);
console.log(`Jarak dari ${fromDir} ke ${toTarget}:`);
console.log('➔', relativeGap);
// Output: '../../assets/images/logo.png'

console.log('\n=== 5. Cross-Platform Handling: POSIX vs Win32 ===');
// Mengubah path gaya Windows menjadi gaya POSIX/URL
const windowsStyle = 'uploads\\images\\avatar.png';
const posixNormalized = windowsStyle.split(path.win32.sep).join(path.posix.sep);
console.log('Gaya Windows      :', windowsStyle);
console.log('Dinormalisasi URL :', posixNormalized);

console.log('\n=== 6. Security Pattern: Mencegah Path Traversal Attack ===');
const PUBLIC_ROOT = path.resolve(currentDir, 'var', 'www', 'public');
console.log(PUBLIC_ROOT);

function safeResolveUserPath(userInput) {
  // 1. Gabungkan dengan root folder yang aman
  const safeTarget = path.resolve(PUBLIC_ROOT, '.' + path.sep + userInput);

  // 2. Verifikasi apakah target masih berada di dalam PUBLIC_ROOT
  const isInsideRoot = safeTarget.startsWith(PUBLIC_ROOT);

  return {
    userInput,
    resolvedPath: safeTarget,
    isSafe: isInsideRoot,
  };
}

console.log('Uji Input Normal       :', safeResolveUserPath('style.css'));
console.log(
  'Uji Input Berbahaya (..):',
  safeResolveUserPath('../../etc/passwd'),
);
