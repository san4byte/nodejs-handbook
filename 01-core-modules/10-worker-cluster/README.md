# Worker Threads & Cluster

> Mengatasi limitasi single-thread: gunakan `worker_threads` untuk eksekusi komputasi CPU berat tanpa memblokir Event Loop, dan `cluster` untuk menduplikasi proses server di seluruh core CPU.

## Core Concepts

- Node.js secara bawaan mengeksekusi JavaScript pada single thread event loop.
- **Worker Threads:** menjalankan thread baru di dalam proses yang sama, bertukar pesan via `parentPort` (`postMessage`). Cocok untuk komputasi CPU intensif (enkripsi, kompresi, parsing gambar).
- **Cluster:** menduplikasi proses Node.js baru (*fork*) dengan memori terpisah, berbagi port jaringan yang sama dengan algoritma load balancing internal (*round-robin*).
- Komunikasi antar thread memakai algoritma Structured Clone atau pengalihan memori via `transferList` untuk performa maksimal.

## Referensi

Daftar API modul `node:worker_threads` dan `node:cluster` yang sering digunakan:

| API / Fitur | Fungsi |
|---|---|
| `new Worker(filename, options?)` | Membuat thread pekerja baru dan mengeksekusi berkas script target |
| `parentPort.postMessage(value, transferList?)` | Mengirim pesan data dari thread worker ke thread utama |
| `cluster.fork(env?)` | Membuat proses worker baru dari proses primary dengan opsi env tambahan |

### `new Worker(filename, options?)`

Konstruktor ini membuat thread pekerja terpisah di dalam proses sistem operasi yang sama.

- `filename` (string | URL, required): Jalur berkas script atau URL modul yang dieksekusi oleh thread pekerja.
- `options` (WorkerOptions, optional): Opsi konfigurasi worker, mencakup `workerData` (any), `env` (object), dan `execArgv` (string[]).
- **Returns:** `Worker`, instance thread pekerja yang mengimplementasikan EventEmitter.

```js
import { Worker } from 'node:worker_threads';

const worker = new Worker(new URL(import.meta.url), {
  workerData: { num: 40 },
});
worker.on('message', (msg) => console.log('Received:', msg));
```

### `parentPort.postMessage(value, transferList?)`

Fungsi ini mengirim data antar thread menggunakan serialisasi structured clone.

- `value` (any, required): Data payload yang dikirim ke thread penerima.
- `transferList` (TransferListItem[], optional): Array objek `ArrayBuffer` atau port memori yang kepemilikannya dialihkan tanpa kloning.
- **Returns:** void.

```js
import { parentPort } from 'node:worker_threads';

if (parentPort) {
  parentPort.postMessage({ status: 'completed', count: 100 });
}
```

### `cluster.fork(env?)`

Metode ini memunculkan proses pekerja anak (*worker process*) baru dari proses utama (*Primary*).

- `env` (object, optional): Objek pasangan key-value variabel lingkungan tambahan yang disuntikkan ke proses anak.
- **Returns:** `cluster.Worker`, instance proses pekerja anak yang berjalan di memori mandiri.

```js
import cluster from 'node:cluster';

if (cluster.isPrimary) {
  const child = cluster.fork({ WORKER_ROLE: 'api-server' });
  console.log('Worker created:', typeof child.process.pid === 'number');
}
// Output: Worker created: true
```

## Examples

### 1. Eksekusi Komputasi di Worker Thread

```js title="src/worker.mjs"
// run: node src/worker.mjs
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

if (isMainThread) {
  const worker = new Worker(new URL(import.meta.url), {
    workerData: { num: 40 },
  });

  worker.on('message', (result) => {
    console.log('Result received from worker:', result);
  });

  worker.on('exit', (code) => {
    console.log('Worker exited with code:', code);
  });
} else {
  function fibonacci(n) {
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      const c = a + b;
      a = b;
      b = c;
    }
    return b;
  }

  const result = fibonacci(workerData.num);
  parentPort.postMessage({ input: workerData.num, fib: result });
}
// Output: Result received from worker: { input: 40, fib: 102334155 }
// Output: Worker exited with code: 0
```

## Real-World Use Case

**Backend**

**Masalah:** satu request kalkulasi data kriptografi berat memblokir seluruh antrean koneksi client lain pada server HTTP selama beberapa detik.
**Solusi:** delegasikan komputasi pemrosesan CPU intensif ke `Worker` thread sehingga event loop utama tetap responsif melayani koneksi web.

```js title="cpu-delegation.mjs"
import { Worker, isMainThread, parentPort } from 'node:worker_threads';

if (isMainThread) {
  const worker = new Worker(new URL(import.meta.url));
  worker.on('message', (data) => {
    console.log('Delegated calculation:', data.sum);
  });
} else {
  let sum = 0;
  for (let i = 0; i < 1_000_000; i++) sum += i;
  parentPort.postMessage({ sum });
}
// Output: Delegated calculation: 499999500000
```

## Pitfalls

- Menggunakan `worker_threads` untuk operasi I/O murni (seperti request HTTP atau query database). I/O sudah ditangani secara asynchronous oleh libuv; spawning thread hanya memboroskan RAM.
  ```js
  // ❌ Incorrect: spawning thread just to fetch an HTTP endpoint
  // new Worker('./fetch-worker.js');

  // ✅ Correct: use native non-blocking async operations directly
  const response = await fetch('https://api.example.com/data');
  ```
- Tidak mendaftarkan error handler pada worker thread, menyebabkan error di dalam worker gagal terdeteksi oleh thread utama.
  ```js
  // ❌ Incorrect: uncaught worker error crashes silently
  const worker = new Worker('./task.js');

  // ✅ Correct: attach error listener
  worker.on('error', (err) => {
    console.error('Worker failed:', err.message);
  });
  ```

## References

- [Node.js Docs: Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Node.js Docs: Cluster](https://nodejs.org/api/cluster.html)

---

Sebelumnya: [09 - Zlib](../09-zlib/README.md) | Berikutnya: [11 - Child Process](../11-child-process/README.md)
