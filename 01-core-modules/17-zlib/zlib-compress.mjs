import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourceFile = __filename;
const compressedFile = path.join(__dirname, 'data', 'zlib-compress.txt');

// Membaca berkas sumber dan mengompresi menggunakan algoritma Gzip
const source = fs.readFileSync(sourceFile);
const result = zlib.gzipSync(source);

fs.writeFileSync(compressedFile, result);
console.log('Sukses melakukan kompresi Gzip ke zlib-compress.txt');
