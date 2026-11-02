# Process & Environment

> Objek `process` menyediakan kontrol global terhadap eksekusi runtime Node.js, pembacaan variabel lingkungan (`env`), manipulasi argumen CLI (`argv`), serta penanganan sinyal terminasi sistem operasi.

## Core Concepts

- `process` adalah objek global bawaan; disarankan mengimpor via `import process from 'node:process'` untuk kepatuhan standar ESM.
- `process.env` menyimpan variabel lingkungan sistem sebagai pasangan key-value yang seluruh nilainya bertipe string.
- Node.js versi 20.6+ menyediakan flag native `--env-file=.env` untuk memuat berkas konfigurasi tanpa ketergantungan library luar seperti `dotenv`.
- `process.argv` menyimpan argumen baris perintah dalam array string, di mana argumen pengguna dimulai dari indeks ke-2.
- Tangani sinyal `SIGINT` dan `SIGTERM` agar server menutup koneksi secara bersih (*graceful shutdown*) sebelum proses berhenti.

## Referensi

Daftar API dan properti proses yang sering digunakan:

| API / Fitur | Fungsi |
|---|---|
| `process.env` | Objek kamus variabel lingkungan sistem operasi yang aktif |
| `process.argv` | Array argumen baris perintah yang diteruskan saat proses dijalankan |
| `process.exit(code?)` | Menghentikan proses Node.js seketika dengan kode status tertentu |
| `process.exitCode` | Mengatur kode status keluar tanpa menghentikan paksa event loop |
| `process.on(event, listener)` | Mendaftarkan listener untuk siklus hidup proses atau sinyal sistem operasi |
| `process.cwd()` | Mengambil lokasi direktori kerja saat ini (*current working directory*) |

### `process.env`

Properti objek ini memuat seluruh variabel lingkungan yang disuntikkan oleh sistem operasi atau argumen `--env-file`.

- Tidak menerima argumen pemanggilan fungsi (merupakan objek properti global).
- **Type:** `Record<string, string | undefined>`, kamus nilai konfigurasi lingkungan runtime.

```js
import process from 'node:process';

const port = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';
console.log('Port configured:', port);
console.log('Production mode:', isProd);
// Output: Port configured: 3000
// Output: Production mode: false
```

### `process.argv`

Properti array ini menampung seluruh argumen baris perintah yang diketikkan pengguna saat mengeksekusi script.

- Tidak menerima argumen pemanggilan fungsi (merupakan array string global).
- **Type:** `string[]`, indeks 0 adalah binary node, indeks 1 adalah lokasi file script, dan indeks 2 ke atas adalah argumen kiriman pengguna.

```js
import process from 'node:process';

const userArgs = process.argv.slice(2);
console.log('Arguments passed:', Array.isArray(userArgs));
// Output: Arguments passed: true
```

### `process.exit(code?)`

Fungsi ini mematikan proses Node.js secara instan tanpa menunggu antrean event loop diselesaikan.

- `code` (number, optional, default `0`): Kode status keluar OS (nilai `0` untuk sukses, selain `0` untuk kegagalan).
- **Returns:** `never`, langsung mematikan eksekusi runtime sistem operasi.

```js
import process from 'node:process';

// Exit with success code 0
process.exit(0);
// Output: process terminates immediately with code 0
```

### `process.on(event, listener)`

Fungsi ini mendaftarkan callback penangan event siklus hidup runtime atau sinyal POSIX sistem operasi.

- `event` (string | symbol, required): Nama kejadian atau sinyal OS (misalnya `'SIGINT'`, `'SIGTERM'`, atau `'uncaughtException'`).
- `listener` ((...args: any[]) => void, required): Fungsi callback yang dipanggil saat sinyal atau event diterima.
- **Returns:** `NodeJS.Process`, instance objek proses saat ini untuk pemanggilan berantai (*method chaining*).

```js
import process from 'node:process';

process.on('SIGINT', (signal) => {
  console.log(`Received signal: ${signal}`);
});
```

## Examples

### 1. Membaca Argumen CLI dan Environment

```js title="src/process.mjs"
// run: node src/process.mjs --port 8080
import process from 'node:process';

const args = process.argv.slice(2);
const port = Number(process.env.PORT || args[1]) || 3000;
const env = process.env.NODE_ENV || 'development';

console.log('PID is number:', typeof process.pid === 'number');
console.log('Platform:', process.platform);
console.log('Target Port:', port);
console.log('Environment:', env);
console.log('Raw Arguments:', args);
// Output: PID is number: true
// Output: Platform: linux
// Output: Target Port: 8080
// Output: Environment: development
// Output: Raw Arguments: [ '--port', '8080' ]
```

## Real-World Use Case

**Backend**

**Masalah:** saat container Docker di-restart atau dihentikan (`SIGTERM`), koneksi database yang sedang menulis data terputus mendadak dan menyebabkan data corrupt.
**Solusi:** tangkap sinyal OS, kuras koneksi aktif (*drain handles*), lalu keluar secara bersih (*graceful shutdown*).

```js title="src/shutdown.mjs"
// run: node src/shutdown.mjs
import process from 'node:process';

let isShuttingDown = false;

function handleShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Received ${signal}. Draining active connections...`);

  setTimeout(() => {
    console.log('All connections drained. Safe exit completed.');
    process.exit(0);
  }, 100);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

console.log('Application started. Simulating shutdown event...');

// Simulate OS signal for demonstration
setTimeout(() => {
  process.emit('SIGTERM');
}, 50);
// Output: Application started. Simulating shutdown event...
// Output: Received SIGTERM. Draining active connections...
// Output: All connections drained. Safe exit completed.
```

## Pitfalls

- Memanggil `process.exit()` di tengah operasi async yang belum selesai. Tunggu semua Promise selesai atau atur `process.exitCode = 1` agar Node keluar secara alami.
  ```js
  // ❌ Incorrect: terminates abruptly before async write finishes
  // saveToDatabase();
  // process.exit(1);

  // ✅ Correct: wait for promises or set exitCode gracefully
  await saveToDatabase();
  process.exitCode = 0;
  ```
- Mengharapkan tipe number dari nilai `process.env`. Semua variabel lingkungan bertipe string; konversi eksplisit dengan `Number()`.
  ```js
  // ❌ Incorrect: '8080' + 1 becomes '80801'
  // const port = process.env.PORT + 1;

  // ✅ Correct: converts string environment variable to number
  const port = Number(process.env.PORT) || 8080;
  ```

## References

- [Node.js Docs: Process](https://nodejs.org/api/process.html)

---

Berikutnya: [02 - Path & URL](../02-path-url/README.md)
