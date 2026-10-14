import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compressedFile = path.join(__dirname, 'data', 'zlib-compress.txt');

// Membaca data biner terkompresi
const compressedData = fs.readFileSync(compressedFile);
console.info('Ukuran data terkompresi (byte):', compressedData.length);

// Melakukan dekompresi kembali ke bentuk teks asli
const originalData = zlib.unzipSync(compressedData);
console.info('Hasil dekompresi teks:');
console.info(originalData.toString('utf-8'));
