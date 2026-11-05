# Util & OS

> Modul `node:util` menyediakan fungsi utilitas internal seperti pewarnaan teks (`styleText`) dan parsing argumen CLI (`parseArgs`). Sementara itu, `node:os` menyediakan telemetri sistem operasi dan perangkat keras.

## Core Concepts

- `util.promisify` menjembatani API Node.js lama berbasis callback `(err, value)` agar bisa digunakan dengan sintaks modern `await`.
- `util.parseArgs` adalah standar resmi Node.js untuk membedah argumen CLI tanpa memerlukan library pihak ketiga.
- `util.styleText` (didukung di Node.js modern) mewarnai teks terminal tanpa memerlukan paket eksternal seperti `chalk`.
- `os.availableParallelism()` mengembalikan jumlah core logika CPU yang tersedia untuk alokasi proses saat ini dengan menghormati pembatasan container (cgroups).

## Referensi

Daftar API modul `node:util` dan `node:os` yang sering digunakan:

| API / Fitur | Fungsi |
|---|---|
| `util.promisify(original)` | Mengubah fungsi berbasis callback error-first menjadi fungsi Promise |
| `util.parseArgs(config)` | Membedah argumen CLI (`process.argv`) menjadi objek nilai terstruktur |
| `util.styleText(format, text)` | Memberi gaya warna ANSI pada teks terminal (tunggal atau kombinasi) |
| `os.availableParallelism()` | Mengembalikan jumlah core CPU logika yang dialokasikan sistem |

### `util.promisify(original)`

Fungsi ini membungkus fungsi lama berbasis callback bergaya Node.js `(...args, (err, val) => {})` menjadi fungsi baru yang mengembalikan Promise.

- `original` (Function, required): Fungsi yang menerima callback error-first pada argumen terakhirnya.
- **Returns:** Function, fungsi wrapper baru yang mengembalikan Promise.

```js
import util from 'node:util';

const sleep = util.promisify(setTimeout);
await sleep(50);
console.log('Slept 50ms');
// Output: Slept 50ms
```

### `util.parseArgs(config)`

Fungsi bawaan `node:util` (Node.js v18.3.0+, stabil di v20.0.0+) ini membedah argumen baris perintah dari `process.argv` menjadi objek nilai terstruktur berbasis skema opsi yang dideklarasikan secara eksplisit. Gunakan fungsi ini sebagai pengganti pembacaan `process.argv` secara manual agar parsing aman terhadap urutan dan tipe argumen.

- `config` (object, opsional): objek konfigurasi parsing:
  - `args` (string[], opsional, default `process.argv.slice(2)`): array argumen yang akan diparse.
  - `options` (object, opsional): definisi opsi — setiap key adalah nama opsi (long flag), dengan properti `type` (`'string'` atau `'boolean'`), `short` (alias karakter tunggal), `default`, dan `multiple` (boolean, mengumpulkan nilai ke array jika `true`).
  - `strict` (boolean, opsional, default `true`): melempar error jika argumen tidak dikenal atau tipe tidak sesuai.
  - `allowPositionals` (boolean, opsional, default `false`): mengizinkan argumen posisi bebas non-flag.
- **Returns:** `{ values: object, positionals: string[] }`, nilai opsi yang berhasil diparsing beserta argumen posisionalnya.

```js
import util from 'node:util';

const { values } = util.parseArgs({
  args: ['--port', '8080', '--dev', '-v'],
  options: {
    port: { type: 'string', default: '3000' },
    dev: { type: 'boolean', default: false },
    verbose: { type: 'boolean', short: 'v' },
  },
});

console.log('Port:', Number(values.port));
// Output: Port: 8080
console.log('Dev mode:', values.dev);
// Output: Dev mode: true
console.log('Verbose:', values.verbose);
// Output: Verbose: true
```

### `util.styleText(format, text)`

Fungsi bawaan ini membungkus string dengan kode warna ANSI terminal tanpa dependensi luar.

- `format` (string | Array<string>, required): Gaya atau warna target (seperti `'green'`, `'bold'`, atau `['green', 'bold']`).
- `text` (string, required): String teks yang diformat.
- **Returns:** string, teks berformat ANSI.

```js
import util from 'node:util';

const badge = util.styleText(['green', 'bold'], 'SUCCESS');
console.log(`Job status: [${badge}]`);
// Output: Job status: [SUCCESS]
```

### `os.availableParallelism()`

Fungsi ini mendeteksi jumlah core CPU logika yang tersedia untuk alokasi proses saat ini.

- Tidak menerima argumen.
- **Returns:** number, jumlah core CPU logika yang dialokasikan sistem (mematuhi batasan cgroups container).

```js
import os from 'node:os';

const cores = os.availableParallelism();
console.log(cores > 0);
// Output: true
```

## Examples

### 1. Telemetri Hardware dan Utilitas Terminal

```js title="src/util.mjs"
// run: node src/util.mjs
import util from 'node:util';
import os from 'node:os';

const status = util.styleText('green', 'ONLINE');
console.log(`Node app: [${status}]`);
// Output: Node app: [ONLINE]

console.log('Available cores > 0:', os.availableParallelism() > 0);
// Output: Available cores > 0: true

console.log('OS Platform:', os.platform());
// Output: OS Platform: linux
```

## Real-World Use Case

**Tooling**

**Masalah:** script worker pool memerlukan konfigurasi flag `--concurrency` dari CLI, dan jika tidak diisi, harus menggunakan jumlah core CPU mesin secara otomatis tanpa dependensi npm tambahan.
**Solusi:** kombinasikan `util.parseArgs` dan `os.availableParallelism()` untuk menentukan alokasi worker.

```js title="worker-config.mjs"
import util from 'node:util';
import os from 'node:os';

function getWorkerCount(argv) {
  const { values } = util.parseArgs({
    args: argv,
    options: {
      concurrency: { type: 'string' },
    },
  });

  return values.concurrency ? Number(values.concurrency) : os.availableParallelism();
}

console.log('Auto-detected cores > 0:', getWorkerCount([]) > 0);
// Output: Auto-detected cores > 0: true
console.log('Explicit flag:', getWorkerCount(['--concurrency', '4']));
// Output: Explicit flag: 4
```

## Pitfalls

- Menggunakan `os.cpus().length` di dalam container Docker atau Kubernetes. Di lingkungan container terbatas (cgroups), fungsi ini sering mengembalikan core host fisik alih-alih alokasi container; selalu gunakan `os.availableParallelism()`.
  ```js
  // ❌ Incorrect: may return total host cores (e.g. 64) instead of container limit (e.g. 2)
  // const totalCores = os.cpus().length;

  // ✅ Correct: respects cgroup quotas
  const realCores = os.availableParallelism();
  console.log('Safe concurrency:', realCores > 0);
  // Output: Safe concurrency: true
  ```

## References

- [Node.js Docs: Util](https://nodejs.org/api/util.html)
- [Node.js Docs: OS](https://nodejs.org/api/os.html)

---

Sebelumnya: [11 - Child Process](../11-child-process/README.md)
