import fs from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const dataDir = path.join(import.meta.dirname, 'data');
await fs.mkdir(dataDir, { recursive: true });

// 1. Pembuatan Folder & Inspeksi Direktori (fs.mkdir & fs.stat)
console.log('--- 1. Pembuatan Folder & Inspeksi Direktori ---');
const subFolder = path.join(dataDir, 'sub-folder');
await fs.mkdir(subFolder, { recursive: true });

const dirStat = await fs.stat(subFolder);
console.log({
  directoryPath: subFolder,
  isDirectory: dirStat.isDirectory(),
});

// 2. Penulisan, Penambahan & Pembacaan Berkas (fs.writeFile, fs.appendFile, fs.readFile)
console.log('\n--- 2. Tulis, Tambah & Baca Berkas ---');
const appConfigFile = path.join(dataDir, 'app-config.json');
const logFile = path.join(dataDir, 'activity.log');

const payload = { PORT: 3000, ENV: 'production' };
await fs.writeFile(appConfigFile, JSON.stringify(payload, null, 2), 'utf-8');

await fs.writeFile(logFile, '[INIT] Server backend started\n', 'utf-8');
await fs.appendFile(logFile, '[INFO] Database pool connected\n', 'utf-8');
await fs.appendFile(logFile, '[READY] Listening on port 3000\n', 'utf-8');

// Membaca string teks (dengan utf-8) vs data biner mentah (Buffer tanpa encoding)
const configContent = await fs.readFile(appConfigFile, 'utf-8');
const rawBuffer = await fs.readFile(appConfigFile);
const logContent = await fs.readFile(logFile, 'utf-8');

console.log({
  readConfigJson: JSON.parse(configContent),
  isRawBuffer: Buffer.isBuffer(rawBuffer),
  bufferByteLength: rawBuffer.length,
  logLines: logContent.trim().split('\n'),
});

// 3. Pembacaan Isi Folder Efisien (fs.readdir withFileTypes)
console.log('\n--- 3. Pembacaan Isi Folder (readdir) ---');
const entries = await fs.readdir(dataDir, { withFileTypes: true });
const entrySummary = Object.fromEntries(
  entries.map((entry) => [
    entry.name,
    entry.isDirectory() ? 'directory' : 'file',
  ]),
);

console.log({
  totalEntries: entries.length,
  scannedEntries: entrySummary,
});

// 4. Inspeksi Metadata & Hak Akses (fs.stat & fs.access)
console.log('\n--- 4. Metadata Berkas & Hak Akses (stat & access) ---');
const accessFile = path.join(dataDir, 'check-access.txt');
await fs.writeFile(accessFile, 'Inspection file content', 'utf-8');

const fileStat = await fs.stat(accessFile);
let isWritable = false;
try {
  await fs.access(accessFile, constants.F_OK | constants.W_OK);
  isWritable = true;
} catch {
  isWritable = false;
}

console.log({
  fileSizeBytes: fileStat.size,
  isRegularFile: fileStat.isFile(),
  isWritable,
  lastModified: fileStat.mtime.toISOString(),
});

// 5. Penyalinan & Penggantian Nama Berkas (fs.copyFile & fs.rename)
console.log('\n--- 5. Penyalinan & Penggantian Nama (copyFile & rename) ---');
const textFile = path.join(dataDir, 'text.txt');
const copyTarget = path.join(subFolder, 'copy-file.txt');
await fs.writeFile(textFile, 'Node.js Modern File System', 'utf-8');
await fs.copyFile(textFile, copyTarget);

const oldFile = path.join(dataDir, 'old-name.txt');
const newFile = path.join(dataDir, 'new-name.txt');
await fs.writeFile(oldFile, 'Document before rename', 'utf-8');
await fs.rename(oldFile, newFile);

console.log({
  copiedContent: await fs.readFile(copyTarget, 'utf-8'),
  renamedContent: await fs.readFile(newFile, 'utf-8'),
});

// 6. Pembersihan Berkas & Folder (fs.unlink & fs.rm)
console.log('\n--- 6. Pembersihan Berkas & Folder (unlink & rm) ---');

// CATATAN PEMBELAJARAN MANDIRI:
// Berkas di bawah ini sengaja dihapus agar folder 'data/' kembali bersih setelah uji coba.
// Jika ingin memeriksa dan melihat berkas-berkas fisik yang dihasilkan di disk,
// silakan KOMENTARI (//) atau hapus baris-baris fs.unlink dan fs.rm di bawah ini.
await fs.unlink(appConfigFile);
await fs.unlink(logFile);
await fs.unlink(accessFile);
await fs.unlink(textFile);
await fs.unlink(copyTarget);
await fs.unlink(newFile);
await fs.rm(subFolder, { recursive: true, force: true });

console.log({
  cleanupCompleted: true,
  note: 'Komentari baris unlink & rm di atas jika ingin memeriksa berkas fisik di disk',
});
