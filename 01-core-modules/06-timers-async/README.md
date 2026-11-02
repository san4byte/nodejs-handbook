# Timers & Async

> Memahami fase Event Loop Libuv, timers berbasis Promise, serta teknik propagasi konteks antar pemanggilan asynchronous menggunakan `AsyncLocalStorage`.

## Core Concepts

- Event Loop memiliki fase utama: Timers (`setTimeout`), Pending Callbacks, Poll (I/O), Check (`setImmediate`), dan Close Callbacks.
- Microtasks (`process.nextTick` dan Promise `.then`) dieksekusi segera setelah operasi sinkron saat ini selesai, mendahului fase macrotask berikutnya.
- Hindari callback nesting lama; gunakan `node:timers/promises` untuk jeda asinkron modern dengan `await setTimeout(ms)`.
- `AsyncLocalStorage` menyediakan penyimpanan state lokal virtual (seperti request ID) yang dapat diakses di mana saja sepanjang rantai async tanpa prop-drilling.

## Referensi

Daftar API timers dan async context yang sering digunakan:

| API / Fitur | Fungsi |
|---|---|
| `setTimeout(delay, value?, options?)` | Menunda eksekusi berbasis Promise via `node:timers/promises` |
| `setImmediate(callback, ...args)` | Menjadwalkan callback pada fase Check di akhir putaran loop |
| `process.nextTick(callback, ...args)` | Menjadwalkan callback microtask dengan prioritas tertinggi |
| `als.run(store, callback, ...args)` | Menjalankan callback dengan konteks store tertentu |

### `setTimeout(delay, value?, options?)`

Fungsi dari `node:timers/promises` ini menunda eksekusi secara asinkron berbasis Promise.

- `delay` (number, optional, default `1`): Durasi jeda dalam satuan milidetik.
- `value` (any, optional): Nilai yang di-resolve setelah jeda waktu selesai.
- `options` (object, optional): Konfigurasi timer seperti `{ signal, ref }` di mana `signal` (`AbortSignal`) dapat membatalkan timer.
- **Returns:** Promise<any>, nilai hasil resolusi yang ditentukan pada argumen `value`.

```js
import { setTimeout } from 'node:timers/promises';

const result = await setTimeout(50, 'resolved-data', { ref: true });
console.log(result);
// Output: resolved-data
```

### `setImmediate(callback, ...args)`

Fungsi ini menjadwalkan eksekusi callback pada fase Check segera setelah fase I/O event loop selesai.

- `callback` ((...args: any[]) => void, required): Fungsi yang dieksekusi pada fase Check.
- `...args` (any[], optional): Deretan argumen yang diteruskan ke parameter fungsi callback.
- **Returns:** `Immediate`, objek timer yang dapat dibatalkan via `clearImmediate()`.

```js
const timer = setImmediate((label, code) => {
  console.log(`Immediate executed: ${label} (${code})`);
}, 'worker-ready', 200);
// Output: Immediate executed: worker-ready (200)
```

### `process.nextTick(callback, ...args)`

Fungsi ini menyisipkan microtask ke dalam antrean tick yang langsung dieksekusi sebelum event loop beralih ke fase berikutnya.

- `callback` ((...args: any[]) => void, required): Fungsi callback microtask prioritas tinggi.
- `...args` (any[], optional): Argumen opsional yang diteruskan ke callback.
- **Returns:** void.

```js
import process from 'node:process';

process.nextTick((scope) => {
  console.log('NextTick executed in:', scope);
}, 'microtask-queue');
// Output: NextTick executed in: microtask-queue
```

### `als.run(store, callback, ...args)`

Method class `AsyncLocalStorage` ini mengikat data konteks ke seluruh rantai eksekusi asinkron di dalam cakupan callback.

- `store` (any, required): Objek konteks yang disimpan sepanjang siklus eksekusi asinkron.
- `callback` ((...args: any[]) => any, required): Fungsi asinkron yang dijalankan dengan akses ke `store`.
- `...args` (any[], optional): Argumen opsional yang diteruskan ke fungsi callback.
- **Returns:** any, mengembalikan nilai hasil eksekusi dari `callback`.

```js
import { AsyncLocalStorage } from 'node:async_hooks';

const als = new AsyncLocalStorage();

await als.run({ traceId: 'REQ-101' }, async (prefix) => {
  const current = als.getStore();
  console.log(`${prefix}: ${current.traceId}`);
}, 'Trace ID');
// Output: Trace ID: REQ-101
```

## Examples

### 1. Urutan Eksekusi Event Loop

```js title="src/event-loop.mjs"
// run: node src/event-loop.mjs
import process from 'node:process';

console.log('1. Synchronous START');
// Output: 1. Synchronous START

setTimeout(() => {
  console.log('4. setTimeout (Macrotask)');
  // Output: 4. setTimeout (Macrotask)
}, 0);

setImmediate(() => {
  console.log('5. setImmediate (Check phase)');
  // Output: 5. setImmediate (Check phase)
});

queueMicrotask(() => {
  console.log('3. queueMicrotask (Microtask)');
  // Output: 3. queueMicrotask (Microtask)
});

process.nextTick(() => {
  console.log('2. process.nextTick (High priority microtask)');
  // Output: 2. process.nextTick (High priority microtask)
});

console.log('1. Synchronous END');
// Output: 1. Synchronous END
```

## Real-World Use Case

**Backend**

**Masalah:** dalam server HTTP bersamaan (*concurrent*), mencatat `requestId` ke setiap fungsi logger memerlukan pengiriman objek request secara eksplisit ke semua fungsi (*prop drilling*).
**Solusi:** ikat identifier request menggunakan `AsyncLocalStorage.run()`, sehingga fungsi pencatatan log di lapisan manapun dapat membaca ID request aktif.

```js title="src/als.mjs"
// run: node src/als.mjs
import { AsyncLocalStorage } from 'node:async_hooks';

const als = new AsyncLocalStorage();

function log(message) {
  const store = als.getStore();
  const id = store ? store.get('reqId') : 'ANONYMOUS';
  console.log(`[${id}] ${message}`);
}

async function queryDatabase() {
  log('Query finished.');
}

async function handle(reqId) {
  const map = new Map([['reqId', reqId]]);
  await als.run(map, async () => {
    log('Incoming request');
    await queryDatabase();
  });
}

await Promise.all([handle('req-101'), handle('req-102')]);
// Output: [req-101] Incoming request
// Output: [req-101] Query finished.
// Output: [req-102] Incoming request
// Output: [req-102] Query finished.
```

## Pitfalls

- Menjalankan `process.nextTick` secara rekursif tak berujung. Ini menyebabkan kelaparan (*starvation*) pada Event Loop dan memblokir seluruh operasi I/O.
  ```js
  // ❌ Incorrect: recursively starves event loop I/O
  // function starve() { process.nextTick(starve); }
  // starve();

  // ✅ Correct: use setImmediate or await setTimeout to yield control
  function safeLoop() {
    setImmediate(() => {
      // Allows I/O events to be processed between ticks
    });
  }
  safeLoop();
  ```
- Memodifikasi objek `store` mutable secara global di luar `als.run()`, yang dapat mencemari konteks antar request konkuren.
  ```js
  // ❌ Incorrect: mutating shared outside object
  // const shared = {};
  // als.run(shared, () => { shared.user = 'alice'; });

  // ✅ Correct: allocate dedicated store per run execution
  await als.run(new Map([['user', 'alice']]), async () => {
    console.log(als.getStore().get('user'));
  });
  // Output: alice
  ```

## References

- [Node.js Docs: Timers](https://nodejs.org/api/timers.html)
- [Node.js Docs: AsyncLocalStorage](https://nodejs.org/api/async_context.html)

---

Sebelumnya: [05 - Buffer & Stream](../05-buffer-stream/README.md) | Berikutnya: [07 - HTTP](../07-http/README.md)
