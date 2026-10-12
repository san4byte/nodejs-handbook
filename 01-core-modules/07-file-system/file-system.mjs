/**
 * 06 - File System Demonstration (Industry Standard)
 *
 * Demonstrasi menyeluruh operasi File System tingkat lanjut:
 * 1. CRUD Berkas Modern via node:fs/promises (readFile, writeFile, appendFile)
 * 2. Pembuatan Direktori Bersarang Rekursif (mkdir recursive)
 * 3. Inspeksi Metadata Berkas (stat / lstat: size, mtime, isFile)
 * 4. Pengecekan Izin & Akses Berkas Aman (access & constants)
 * 5. Pembacaan Isi Direktori Efisien (readdir withFileTypes: Dirent)
 * 6. Penyalinan Berkas & Direktori (copyFile & cp)
 * 7. Pola Standar Industri: Atomic File Write Pattern (rename)
 * 8. Penghapusan Berkas & Pembersihan Direktori (unlink & rm force)
 */

import fs from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 1. Inisialisasi Path Direktori Lokal
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const sandboxDir = path.join(dataDir, 'sandbox');

console.log('=== 1. Direktori Bersarang Rekursif (fs.mkdir) ===');
// recursive: true mencegah error jika folder sudah ada, mirip 'mkdir -p'
await fs.mkdir(sandboxDir, { recursive: true });
console.log('✓ Direktori sandbox siap:', sandboxDir);

console.log('\n=== 2. Penulisan, Penambahan & Pembacaan Berkas ===');
const targetFile = path.join(sandboxDir, 'catatan-server.log');

// Menulis berkas baru
await fs.writeFile(targetFile, '[INIT] Server backend dimulai\n', 'utf-8');
console.log('✓ Menulis berkas awal berhasil.');

// Menambahkan data tanpa menimpa (appendFile)
await fs.appendFile(
  targetFile,
  '[INFO] Koneksi database pool terhubung\n',
  'utf-8',
);
await fs.appendFile(
  targetFile,
  '[INFO] Worker thread siap menerima pekerjaan\n',
  'utf-8',
);
console.log('✓ Berhasil menambahkan 2 baris log baru via appendFile.');

// Membaca isi berkas
const fileContent = await fs.readFile(targetFile, 'utf-8');
console.log('Isi berkas saat ini:\n' + fileContent.trim());

console.log('\n=== 3. Inspeksi Metadata Berkas (fs.stat) ===');
const stats = await fs.stat(targetFile);
console.table({
  'Ukuran (Bytes)': stats.size,
  'Tipe Berkas': stats.isFile() ? 'Regular File' : 'Directory',
  'Waktu Dibuat': stats.birthtime.toISOString(),
  'Terakhir Dimodifikasi': stats.mtime.toISOString(),
});

console.log('\n=== 4. Pengecekan Izin & Eksistensi Berkas (fs.access) ===');
try {
  // Mengecek apakah file ada (F_OK) dan dapat ditulis (W_OK)
  await fs.access(targetFile, constants.F_OK | constants.W_OK);
  console.log('✓ Berkas ada dan memiliki izin Tulis (Writable).');
} catch {
  console.warn('⚠️ Berkas tidak dapat diakses atau dibaca.');
}

console.log(
  '\n=== 5. Pembacaan Isi Folder Efisien (fs.readdir withFileTypes) ===',
);
// Membuat subfile dummy tambahan
await fs.writeFile(
  path.join(sandboxDir, 'config.json'),
  '{"env":"prod"}\n',
  'utf-8',
);

// withFileTypes mengembalikan objek Dirent sehingga tidak perlu memanggil fs.stat terpisah
const entries = await fs.readdir(sandboxDir, { withFileTypes: true });
const scannedList = entries.map((entry) => ({
  Nama: entry.name,
  Jenis: entry.isDirectory() ? 'Direktori' : 'Berkas',
}));
console.table(scannedList);

console.log('\n=== 6. Pola Industri: Atomic Write Pattern ===');
// Menulis ke file temporary terlebih dahulu, lalu me-rename secara atomik.
// Jika listrik padam di tengah jalan, berkas utama tidak akan korup/rusak!
const liveConfigFile = path.join(sandboxDir, 'app-config.json');
const tempConfigFile = path.join(sandboxDir, 'app-config.json.tmp');

await fs.writeFile(
  tempConfigFile,
  JSON.stringify({ port: 8080, secure: true }, null, 2),
  'utf-8',
);
await fs.rename(tempConfigFile, liveConfigFile); // Operasi atomik di tingkat filesystem OS
console.log('✓ Atomic write berhasil: file .tmp di-rename ke app-config.json');

console.log('\n=== 7. Penyalinan Berkas & Direktori (fs.copyFile & cp) ===');
const backupConfigFile = path.join(sandboxDir, 'app-config.json.bak');
await fs.copyFile(liveConfigFile, backupConfigFile);
console.log(
  '✓ Berkas berhasil dicadangkan ke:',
  path.basename(backupConfigFile),
);

console.log('\n=== 8. Pembersihan Aman (fs.unlink & fs.rm) ===');
// Menghapus satu berkas via unlink
await fs.unlink(backupConfigFile);
console.log('✓ Berkas backup dihapus via fs.unlink.');

// Menghapus seluruh folder sementara secara rekursif (mirip rm -rf)
await fs.rm(sandboxDir, { recursive: true, force: true });
console.log(
  '✓ Direktori sandbox dibersihkan tuntas via fs.rm(recursive, force).',
);
