# File System (fs/promises)

> Modul `node:fs/promises` menyediakan antarmuka asinkron berbasis Promise untuk membaca, menulis, membuat direktori, dan memanipulasi berkas di sistem operasi.

## Core Concepts
- Selalu gunakan `node:fs/promises` untuk operasi non-blocking berbasis `async/await`. Hindari versi sinkron (`fs.*Sync`) di server HTTP.
- Operasi tulis file berulang secara langsung dapat merusak file jika proses mati tiba-tiba.
- Terapkan pola *atomic write*: tulis data ke file sementara (`.tmp`), lalu timpa dengan `fs.rename()`.
- Error filesystem membawa kode standar POSIX, seperti `'ENOENT'` (file tidak ditemukan) dan `'EEXIST'` (file/folder sudah ada).

## Referensi

Daftar fungsi `node:fs/promises` yang sering digunakan:

| API / Fitur | Fungsi |
|---|---|
| `fs.readFile(path, options?)` | Membaca seluruh isi file ke memori (string atau Buffer) |
| `fs.writeFile(file, data, options?)` | Menulis data ke file tujuan (membuat baru, menimpa, atau append) |
| `fs.rename(oldPath, newPath)` | Mengubah nama atau memindahkan file secara atomik |
| `fs.mkdir(path, options?)` | Membuat direktori baru (termasuk folder bersarang bertingkat) |
| `fs.stat(path)` | Memeriksa metadata berkas seperti ukuran byte dan waktu modifikasi |
| `fs.unlink(path)` | Menghapus berkas dari disk |

### `fs.readFile(path, options?)`

Fungsi ini membaca seluruh konten berkas ke memori.

- `path` (string | Buffer | URL, wajib): lokasi file target.
- `options` (string | object, opsional): string encoding (misal `'utf8'`), atau objek konfigurasi `{ encoding, flag }`. Jika diabaikan, fungsi mengembalikan biner `Buffer`.
- **Returns:** `Promise<string | Buffer>`, teks atau buffer biner isi file.

```js
import fs from 'node:fs/promises';

const content = await fs.readFile('data.json', { encoding: 'utf8', flag: 'r' });
console.log(typeof content === 'string');
// Output: true
```

### `fs.writeFile(file, data, options?)`

Fungsi ini menuliskan data ke berkas target.

- `file` (string | Buffer | URL, wajib): lokasi berkas tujuan.
- `data` (string | Buffer | Uint8Array, wajib): konten yang akan disimpan.
- `options` (string | object, opsional, default `'utf8'`): konfigurasi penulisan seperti `encoding` (string), `mode` (izin hak akses POSIX), dan `flag` (misalnya `'w'` untuk menimpa, `'a'` untuk append).
- **Returns:** `Promise<void>`, selesai saat data berhasil ditulis ke disk.

```js
import fs from 'node:fs/promises';

await fs.writeFile('app.log', 'Log entry\n', { encoding: 'utf8', flag: 'a' });
// Output: content successfully appended to app.log
```

### `fs.rename(oldPath, newPath)`

Fungsi ini memindahkan atau mengganti nama berkas secara atomik dalam partisi disk yang sama.

- `oldPath` (string, wajib): path berkas asal.
- `newPath` (string, wajib): path berkas tujuan.
- **Returns:** `Promise<void>`, selesai saat operasi rename tuntas.

```js
import fs from 'node:fs/promises';

await fs.rename('state.tmp', 'state.json');
// Output: state.tmp atomically renamed to state.json
```

### `fs.mkdir(path, options?)`

Fungsi ini membuat direktori baru di sistem berkas.

- `path` (string, wajib): lokasi direktori target.
- `options` (object, opsional): konfigurasi pembuatan folder `{ recursive: boolean, mode: number }`. Jika `recursive: true` diaktifkan, seluruh folder induk otomatis dibuat tanpa error jika sudah ada.
- **Returns:** `Promise<string | undefined>`, path direktori pertama yang berhasil dibuat jika `recursive: true`.

```js
import fs from 'node:fs/promises';

await fs.mkdir('storage/cache/v1', { recursive: true });
// Output: directory hierarchy created successfully
```

## Examples

### 1. Operasi CRUD Berkas

```js title="src/crud.mjs"
// run: node src/crud.mjs
import fs from 'node:fs/promises';
import path from 'node:path';

const file = path.resolve('sample.txt');
await fs.writeFile(file, 'Hello Node.js', 'utf8');

const content = await fs.readFile(file, 'utf8');
console.log('Read:', content);
// Output: Read: Hello Node.js

await fs.unlink(file);
console.log('Unlink complete.');
// Output: Unlink complete.
```

## Real-World Use Case

**Backend**

**Masalah:** pemadaman listrik atau server crash saat `writeFile` sedang berjalan menghasilkan file konfigurasi yang kosong atau JSON yang terpotong setengah.
**Solusi:** tulis data ke file temporer dengan ID acak terlebih dahulu, lalu timpa file utama menggunakan `fs.rename()`.

```js title="atomic-write.mjs"
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
await safeSave(target, { version: 1, ready: true });
const readData = JSON.parse(await fs.readFile(target, 'utf8'));
console.log('Status ready:', readData.ready);
// Output: Status ready: true

await fs.unlink(target);
```

## Pitfalls
- Menggunakan `fs.readFile()` untuk berkas berukuran beberapa gigabyte.
  Seluruh isi berkas dimuat ke RAM dan memicu V8 heap overflow; gunakan stream.
  ```js
  // ❌ Incorrect: loads entire multi-gigabyte file into memory
  const buffer = await fs.readFile('huge-dataset.csv');

  // ✅ Correct: streams file chunk-by-chunk with low memory usage
  const stream = fs.createReadStream('huge-dataset.csv');
  ```
- Menggunakan `fs.exists()` yang sudah usang (*deprecated*).
  Gunakan penanganan `try...catch` bersama `fs.stat()` atau `fs.readFile()`.
  ```js
  // ❌ Incorrect: deprecated and vulnerable to race condition
  if (fs.existsSync('config.json')) readConfig();

  // ✅ Correct: checks existence via stat or direct read with error handling
  try {
    const config = await fs.readFile('config.json', 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') console.log('File not found');
  }
  ```

## References
- [Node.js Docs: File System](https://nodejs.org/api/fs.html)

---
Sebelumnya: [02 - Path & URL](../02-path-url/README.md) | Berikutnya: [04 - Events](../04-events/README.md)
