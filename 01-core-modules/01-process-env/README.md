# Process & Environment

> Objek `process` menyediakan kontrol global terhadap eksekusi runtime Node.js, pembacaan variabel lingkungan (`env`), manipulasi argumen CLI (`argv`), metrik telemetri proses, serta penanganan sinyal terminasi sistem operasi.

## Core Concepts

- `process` adalah objek global bawaan; disarankan mengimpor via `import process from 'node:process'` untuk kepatuhan standar ESM.
- `process.env` menyimpan variabel lingkungan sistem sebagai pasangan key-value yang seluruh nilainya bertipe string.
- Node.js versi 20.6+ menyediakan flag native `--env-file=.env` (dan fungsi programatik `process.loadEnvFile()` di v20.12+) untuk memuat berkas konfigurasi tanpa dependensi library luar.
- `process.argv` menyimpan argumen baris perintah dalam array string, di mana argumen pengguna dimulai dari indeks ke-2.
- Tangani sinyal `SIGINT` dan `SIGTERM` agar server menutup koneksi secara bersih (*graceful shutdown*) sebelum proses berhenti.
- Terapkan validasi *fail-fast* saat startup: hentikan proses sedini mungkin (`process.exitCode = 1`) jika konfigurasi wajib tidak valid daripada menelan kesalahan dengan nilai default diam-diam.
- *Graceful shutdown* wajib memiliki batas waktu paksa (*force exit timeout* dengan `.unref()`): cegah proses menggantung tanpa batas sebelum dihentikan paksa oleh orchestrator (`SIGKILL`).

## Referensi

Daftar API dan properti proses yang sering digunakan:

| API / Fitur | Fungsi |
|---|---|
| `process.env` | Objek kamus variabel lingkungan sistem operasi yang aktif |
| `process.loadEnvFile(path?)` | Memuat berkas `.env` ke `process.env` secara programatik (Node.js v20.12.0+) |
| `process.argv` | Array argumen baris perintah mentah yang diteruskan saat proses dijalankan |
| `process.exit(code?)` | Menghentikan proses Node.js seketika dengan kode status tertentu |
| `process.exitCode` | Mengatur kode status keluar tanpa menghentikan paksa event loop |
| `process.on(event, listener)` | Mendaftarkan listener untuk siklus hidup proses atau sinyal sistem operasi |
| `process.memoryUsage()` | Mengembalikan metrik penggunaan memori proses (RSS, heap, buffer) dalam bytes |
| `process.uptime()` | Mengembalikan durasi waktu berjalan proses Node.js dalam satuan detik |
| `process.hrtime.bigint()` | Mengukur interval waktu resolusi tinggi berpresisi nanodetik untuk benchmark |
| `uncaughtException` | Event penanganan error fatal JavaScript yang tidak tertangkap di event loop |
| `unhandledRejection` | Event penanganan Promise yang di-reject tanpa blok catch |

### `process.env`

Properti objek ini memuat seluruh variabel lingkungan yang disuntikkan oleh sistem operasi atau argumen konfigurasi.

- Tidak menerima argumen pemanggilan fungsi (merupakan objek properti global).
- **Type:** `Record<string, string | undefined>`, kamus nilai konfigurasi lingkungan runtime.

```js
import process from 'node:process';

const port = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';
console.log('Port configured:', port);
// Output: Port configured: 3000
console.log('Production mode:', isProd);
// Output: Production mode: false
```

### `process.loadEnvFile(path?)`

Fungsi ini (Node.js v20.12.0+) memuat berkas konfigurasi `.env` secara programatik langsung ke dalam `process.env`. Gunakan flag CLI `--env-file` jika konfigurasi dibutuhkan sejak awal pemuatan modul, atau gunakan `process.loadEnvFile()` jika lokasi berkas baru ditentukan secara dinamis saat runtime.

- `path` (string | URL | Buffer, opsional, default `'./.env'`): lokasi berkas `.env` yang akan dibaca.
- **Returns:** `void`, variabel langsung disuntikkan ke kamus `process.env`.

```js
import process from 'node:process';
import fs from 'node:fs';

fs.writeFileSync('.env.sample', 'APP_NAME=Handbook\n');
process.loadEnvFile('.env.sample');
console.log('App name:', process.env.APP_NAME);
// Output: App name: Handbook
fs.unlinkSync('.env.sample');
```

### `process.argv`

Properti array ini menampung seluruh argumen baris perintah mentah yang diketikkan pengguna saat mengeksekusi script.

- Tidak menerima argumen pemanggilan fungsi (merupakan array string global).
- **Type:** `string[]`, indeks 0 adalah binary node, indeks 1 adalah lokasi file script, dan indeks 2 ke atas adalah argumen kiriman pengguna.

```js
import process from 'node:process';

const userArgs = process.argv.slice(2);
console.log('Arguments passed:', Array.isArray(userArgs));
// Output: Arguments passed: true
```

> Untuk parsing argumen CLI bertipe flag (`--port 8080`, `--dev`) secara aman tanpa bergantung pada urutan posisi, gunakan `util.parseArgs` dari `node:util` — dibahas tuntas di [Bab 12 - Util & OS](../12-util-os/README.md).

### `process.exit(code?)`

Fungsi ini mematikan proses Node.js secara instan tanpa menunggu antrean event loop diselesaikan.

- `code` (number, opsional, default `0`): kode status keluar OS (nilai `0` untuk sukses, selain `0` untuk kegagalan).
- **Returns:** `never`, langsung mematikan eksekusi runtime sistem operasi.

```js
import process from 'node:process';

// Exit with success code 0
process.exit(0);
// Output: process terminates immediately with code 0
```

### `process.exitCode`

Properti ini menentukan kode status keluar OS yang akan dipakai ketika event loop Node.js selesai secara alami.

- Tidak menerima argumen pemanggilan fungsi (merupakan properti getter/setter angka).
- **Type:** `number | undefined`, default bernilai `undefined` (keluar dengan kode `0` jika tidak ada error tak tertangani).

```js
import process from 'node:process';

process.exitCode = 1;
console.log('Exit code set:', process.exitCode);
// Output: Exit code set: 1
```

### `process.on(event, listener)`

Fungsi ini mendaftarkan callback penangan event siklus hidup runtime atau sinyal POSIX sistem operasi.

- `event` (string | symbol, wajib): nama kejadian atau sinyal OS (misalnya `'SIGINT'`, `'SIGTERM'`).
- `listener` ((...args: any[]) => void, wajib): fungsi callback yang dipanggil saat sinyal atau event diterima.
- **Returns:** `NodeJS.Process`, instance objek proses saat ini untuk pemanggilan berantai (*method chaining*).

```js
import process from 'node:process';

process.on('SIGINT', (signal) => {
  console.log(`Received signal: ${signal}`);
  // Output: Received signal: SIGINT
});
process.emit('SIGINT', 'SIGINT');
```

### `process.memoryUsage()`

Fungsi ini mengembalikan rincian metrik alokasi memori yang dipakai proses Node.js dalam satuan byte.

- Tidak menerima argumen.
- **Returns:** `object`, berisi properti `rss` (Resident Set Size), `heapTotal` (total alokasi heap V8), `heapUsed` (heap terpakai), `external` (memori C++ terikat V8), dan `arrayBuffers`.

```js
import process from 'node:process';

const mem = process.memoryUsage();
console.log('Heap used exists:', typeof mem.heapUsed === 'number');
// Output: Heap used exists: true
console.log('RSS is positive:', mem.rss > 0);
// Output: RSS is positive: true
```

### `process.uptime()`

Fungsi ini mengembalikan durasi waktu berjalan proses Node.js dalam satuan detik.

- Tidak menerima argumen.
- **Returns:** `number`, total durasi detik sejak proses dimulai (termasuk nilai pecahan desimal).

```js
import process from 'node:process';

const uptime = process.uptime();
console.log('Uptime is number:', typeof uptime === 'number');
// Output: Uptime is number: true
console.log('Uptime non-negative:', uptime >= 0);
// Output: Uptime non-negative: true
```

### `process.hrtime.bigint()`

Fungsi ini (Node.js v10.7.0+) menghasilkan timestamp monotonic berpresisi tinggi dalam satuan nanodetik (`bigint`) untuk benchmark dan pengukuran durasi komputasi.

- Tidak menerima argumen.
- **Returns:** `bigint`, waktu resolusi tinggi sistem dalam nanodetik.

```js
import process from 'node:process';

const start = process.hrtime.bigint();
const elapsed = process.hrtime.bigint() - start;
console.log('Elapsed is bigint:', typeof elapsed === 'bigint');
// Output: Elapsed is bigint: true
console.log('Elapsed non-negative:', elapsed >= 0n);
// Output: Elapsed non-negative: true
```

### `process.on('uncaughtException', listener)`

Event ini dipancarkan ketika terjadi exception JavaScript sinkron yang tidak tertangkap oleh blok `try...catch` dan naik hingga ke pucuk event loop.

- `event` (string, wajib): nama event `'uncaughtException'`.
- `listener` ((err: Error, origin: string) => void, wajib): callback penanganan dengan parameter `err` (objek Error penyebab exception) dan `origin` (`'uncaughtException'` atau `'unhandledRejection'`).
- **Returns:** `NodeJS.Process`, instance objek proses aktif.

```js
import process from 'node:process';

process.on('uncaughtException', (err, origin) => {
  console.log('Caught exception:', err.message);
  // Output: Caught exception: Database crashed
  console.log('Exception origin:', origin);
  // Output: Exception origin: uncaughtException
});

process.emit('uncaughtException', new Error('Database crashed'), 'uncaughtException');
```

### `process.on('unhandledRejection', listener)`

Event ini dipancarkan ketika sebuah `Promise` di-reject dan tidak memiliki penangan `.catch()` atau penolakan dalam satu putaran event loop.

- `event` (string, wajib): nama event `'unhandledRejection'`.
- `listener` ((reason: any, promise: Promise) => void, wajib): callback penanganan dengan parameter `reason` (alasan rejection, umumnya berupa objek Error) dan `promise` (objek Promise yang mengalami rejection).
- **Returns:** `NodeJS.Process`, instance objek proses aktif.

```js
import process from 'node:process';

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled reason:', reason.message);
  // Output: Unhandled reason: Network timeout
  console.log('Promise is valid:', promise instanceof Promise);
  // Output: Promise is valid: true
});

const rejectedPromise = Promise.reject(new Error('Network timeout'));
process.emit('unhandledRejection', new Error('Network timeout'), rejectedPromise);
rejectedPromise.catch(() => {});
```

## Examples

### 1. Membaca Environment dan Argumen CLI

Membaca variabel lingkungan runtime dan argumen baris perintah mentah dari `process.argv`. Untuk parsing argumen bertipe flag yang lebih terstruktur, lihat `util.parseArgs` di [Bab 12 - Util & OS](../12-util-os/README.md).

```js title="src/process.mjs"
// run: node src/process.mjs --port 8080
import process from 'node:process';

const userArgs = process.argv.slice(2);
const env = process.env.NODE_ENV || 'development';

console.log('PID is number:', typeof process.pid === 'number');
// Output: PID is number: true
console.log('Platform:', process.platform);
// Output: Platform: linux
console.log('Raw Arguments:', userArgs);
// Output: Raw Arguments: [ '--port', '8080' ]
console.log('Environment:', env);
// Output: Environment: development
```

### 2. Validasi Konfigurasi Startup (Fail-Fast Pattern)

Memvalidasi konfigurasi runtime saat aplikasi pertama kali boot. Pola umum seperti `Number(x) || 3000` sangat berbahaya karena menelan nilai salah secara diam-diam (misalnya `PORT=0` atau `PORT=abc` yang keliru otomatis fallback ke `3000` tanpa disadari). Validasi ketat mengumpulkan semua kesalahan lalu menghentikan proses sedini mungkin.

```js title="src/config.mjs"
// run: node src/config.mjs
import process from 'node:process';

function loadConfig(env = process.env) {
  const errors = [];

  // 1. Mandatory variable
  if (!env.DATABASE_URL || env.DATABASE_URL.trim() === '') {
    errors.push('DATABASE_URL is required but missing');
  }

  // 2. Whitelist validation
  const allowedEnvs = ['development', 'production', 'test'];
  const nodeEnv = env.NODE_ENV || 'development';
  if (!allowedEnvs.includes(nodeEnv)) {
    errors.push(`NODE_ENV must be one of [${allowedEnvs.join(', ')}], received '${nodeEnv}'`);
  }

  // 3. Strict port validation
  let port = 3000;
  if (env.PORT !== undefined) {
    const parsed = Number(env.PORT);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
      errors.push(`PORT must be an integer (1-65535), received '${env.PORT}'`);
    } else {
      port = parsed;
    }
  }

  if (errors.length > 0) {
    console.error('Configuration validation failed:');
    for (const err of errors) {
      console.error(`- ${err}`);
    }
    process.exitCode = 1;
    return null;
  }

  return { port, nodeEnv, databaseUrl: env.DATABASE_URL };
}

const config = loadConfig({
  PORT: '8080',
  NODE_ENV: 'production',
  DATABASE_URL: 'postgres://localhost:5432/db',
});
console.log('Config loaded successfully:', config !== null);
// Output: Config loaded successfully: true

const invalidConfig = loadConfig({ PORT: 'invalid_port' });
console.log('Invalid config blocked:', invalidConfig === null && process.exitCode === 1);
// Output: Invalid config blocked: true
```

### 3. Memantau Metrik Proses (Memory, Uptime, Durasi)

Menggunakan `process.memoryUsage()`, `process.uptime()`, dan `process.hrtime.bigint()` untuk mencetak snapshot kesehatan proses dan mengukur durasi eksekusi komputasi.

```js title="src/process-info.mjs"
// run: node src/process-info.mjs
import process from 'node:process';

console.log('PID:', process.pid);
// Output: PID: <number>
console.log('Platform:', process.platform);
// Output: Platform: linux
console.log('Node.js Version:', process.version);
// Output: Node.js Version: v24.15.0

const memory = process.memoryUsage();
console.log('RSS (MB):', (memory.rss / 1024 / 1024).toFixed(2));
// Output: RSS (MB): 46.30
console.log('Heap Used (MB):', (memory.heapUsed / 1024 / 1024).toFixed(2));
// Output: Heap Used (MB): 4.70

console.log('Uptime (s):', process.uptime().toFixed(2));
// Output: Uptime (s): 0.18

const start = process.hrtime.bigint();
for (let i = 0; i < 1_000_000; i++) Math.sqrt(i);
const duration = Number(process.hrtime.bigint() - start) / 1_000_000;
console.log('Execution duration (ms):', duration.toFixed(2));
// Output: Execution duration (ms): 50.25
```

### 4. Health Check Monitor dengan Penanganan Sinyal

Memonitor memori dan uptime secara periodik sambil menangani `SIGINT`, `uncaughtException`, dan `unhandledRejection` agar proses bisa dihentikan dengan bersih atau dicatat sebelum crash.

```js title="src/process-monitor.mjs"
// run: node src/process-monitor.mjs
import process from 'node:process';

function monitorMemory() {
  const memory = process.memoryUsage();
  console.log('RSS (MB):', (memory.rss / 1024 / 1024).toFixed(2));
  console.log('Heap Used (MB):', (memory.heapUsed / 1024 / 1024).toFixed(2));
  console.log('Uptime (s):', process.uptime().toFixed(2));
}

const monitor = setInterval(monitorMemory, 1000);

process.on('SIGINT', () => {
  console.log('SIGINT received. Stopping monitor...');
  // Output: SIGINT received. Stopping monitor...
  clearInterval(monitor);
  process.exitCode = 0;
});

process.on('uncaughtException', (err) => {
  console.error('Fatal crash, shutting down:', err.message);
  clearInterval(monitor);
  process.exitCode = 1;
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason.message);
  clearInterval(monitor);
  process.exitCode = 1;
});

console.log('Monitor started. Press Ctrl+C to stop.');
// Output: Monitor started. Press Ctrl+C to stop.
```

## Real-World Use Case

**Backend**

**Masalah:** saat container Docker di-deploy ulang atau dimatikan (`SIGTERM`), koneksi HTTP aktif dan transaksi database terputus paksa sehingga data corrupt dan user menerima error 502 Bad Gateway.
**Solusi:** pasang handler sinyal dengan guard proteksi eksekusi ganda, hentikan penerimaan koneksi baru via `server.close()`, selesaikan transaksi aktif dengan timeout fallback (`.unref()`), dan biarkan proses keluar alami dengan `process.exitCode = 0`.

```js title="src/shutdown.mjs"
// run: node src/shutdown.mjs
import http from 'node:http';
import process from 'node:process';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server ready');
});

async function closeDatabase() {
  // Simulate draining active database connection pools
  return new Promise((resolve) => setTimeout(resolve, 50));
}

let isShuttingDown = false;

function setupGracefulShutdown(server) {
  async function shutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`Received ${signal}. Starting graceful shutdown...`);

    // Force exit timer if cleanup hangs beyond orchestrator grace period
    const forceExitTimer = setTimeout(() => {
      console.error('Shutdown timed out. Forcing process termination.');
      process.exit(1);
    }, 5000);
    forceExitTimer.unref();

    // 1. Stop receiving new connections; wait for ongoing requests to finish
    server.close(async () => {
      console.log('HTTP server closed. No longer accepting connections.');

      try {
        // 2. Cleanly close database and external resources
        await closeDatabase();
        console.log('Database connections closed cleanly.');
        // Allow event loop to exit naturally with status 0
        process.exitCode = 0;
      } catch (err) {
        console.error('Error during resource cleanup:', err.message);
        process.exitCode = 1;
      }
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

setupGracefulShutdown(server);

server.listen(0, () => {
  console.log('Server is listening.');
  // Trigger termination signal programmatically for demonstration
  process.emit('SIGTERM');
});
// Output: Server is listening.
// Output: Received SIGTERM. Starting graceful shutdown...
// Output: HTTP server closed. No longer accepting connections.
// Output: Database connections closed cleanly.
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
- Menjalankan proses Node di Docker sebagai PID 1 menggunakan format shell (`CMD npm start`). Shell `/bin/sh` menelan sinyal POSIX sehingga container tidak merespons `SIGTERM` dan dimatikan paksa (`SIGKILL`) setelah 10 detik.
  ```dockerfile
  # ❌ Incorrect: shell form runs /bin/sh as PID 1, swallowing SIGTERM
  # CMD npm start

  # ✅ Correct: exec form runs Node directly as PID 1 (or run container with --init)
  # CMD ["node", "src/server.mjs"]
  ```
- Menangani `uncaughtException` lalu membiarkan proses tetap berjalan normal seolah tidak terjadi apa-apa. State memori aplikasi sudah berada dalam kondisi *undefined* dan korup.
  ```js
  // ❌ Incorrect: continuing process execution after uncaught exception
  process.on('uncaughtException', (err) => {
    console.error('Error occurred:', err.message);
    // Process keeps running with corrupted memory state
  });

  // ✅ Correct: log diagnostic info, set exitCode, and exit cleanly
  process.on('uncaughtException', (err) => {
    console.error('Fatal crash, shutting down:', err);
    process.exitCode = 1;
  });
  ```
- Mendaftarkan handler sinyal shutdown berkali-kali tanpa guard boolean, yang memicu eksekusi pembersihan ganda (*double cleanup* atau *race condition*).
  ```js
  // ❌ Incorrect: triggers concurrent cleanup workflows on repeated signals
  process.on('SIGTERM', () => closeDatabase());
  process.on('SIGINT', () => closeDatabase());

  // ✅ Correct: guard with flag to prevent duplicate execution
  let isShuttingDown = false;
  function onSignal() {
    if (isShuttingDown) return;
    isShuttingDown = true;
    closeDatabase();
  }
  process.on('SIGTERM', onSignal);
  process.on('SIGINT', onSignal);
  ```

## References

- [Node.js Docs: Process](https://nodejs.org/api/process.html)

---

Berikutnya: [02 - Path & URL](../02-path-url/README.md)
