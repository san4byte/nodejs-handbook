/**
 * 01 - Standard Library Demonstration (Industry Standard)
 *
 * Demonstrasi penggunaan Node.js Built-in Standard Library:
 * 1. Penggunaan awalan protokol resmi 'node:'
 * 2. Mengakses fungsionalitas native tanpa instalasi dependensi NPM
 * 3. Fitur modern Node.js yang menggantikan dependensi eksternal populer
 */

import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import url from 'node:url';

// 1. Ekstraksi metadata file & direktori di lingkungan ES Modules
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== 1. Built-in Path & Environment Metadata ===');
console.log('File aktif      :', __filename);
console.log('Direktori aktif :', __dirname);
console.log('Separator OS    :', path.sep);

// 2. Akses spesifikasi sistem operasi via node:os
console.log('\n=== 2. Built-in OS Inspection ===');
console.log('Platform OS     :', os.platform());
console.log('Arsitektur CPU  :', os.arch());
console.log('Jumlah Inti CPU :', os.cpus().length, 'cores');
console.log('Hostname Mesin  :', os.hostname());

// 3. Built-in Cryptography (Modern Node.js: Menggantikan package 'uuid')
console.log('\n=== 3. Built-in Crypto (UUID v4 Generator) ===');
const transactionId = crypto.randomUUID();
console.log('Generated UUID v4 (Zero-Dependency):', transactionId);

// 4. Memverifikasi modul bawaan vs modul luar
console.log('\n=== 4. Supply Chain Security (node: Protocol Prefix) ===');
console.log(
  '✓ Awalan "node:" menjamin kode mengeksekusi modul internal Node.js.',
);
console.log(
  '✓ Menghindari serangan Dependency Confusion / Typo-squatting di NPM.',
);
