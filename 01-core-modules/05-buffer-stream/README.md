# Buffer & Stream

> `Buffer` mengelola data biner mentah pada alokasi memori langsung di luar heap V8, sedangkan `Stream` mengalirkan potongan data (*chunks*) bertahap agar konsumsi RAM tetap hemat dan efisien.

## Core Concepts

- `Buffer` dialokasikan langsung di memori C++ di luar batas heap V8.
- 4 jenis Stream: `Readable` (sumber data), `Writable` (tujuan data), `Duplex` (baca dan tulis), dan `Transform` (memodifikasi chunk saat mengalir).
- *Backpressure* terjadi jika sumber mengirim data lebih cepat daripada kemampuan tujuan memprosesnya. Gunakan `stream.pipeline` untuk menangani backpressure secara otomatis.
- Streams bekerja secara asinkron dan ramah event, ideal untuk berkas berukuran gigabyte atau jaringan berkecepatan tinggi.

## Referensi

Daftar API `node:buffer` dan `node:stream` yang sering digunakan:

| API / Fitur | Fungsi |
|---|---|
| `Buffer.from(data, encoding?)` | Membuat instance Buffer dari string, array integer, atau buffer lain |
| `Buffer.alloc(size, fill?, encoding?)` | Mengalokasikan buffer berukuran tetap dengan inisialisasi nilai pengisi |
| `buffer.toString(encoding?, start?, end?)` | Mengubah biner buffer kembali ke teks string pada rentang byte tertentu |
| `pipeline(...streams, options?)` | Menghubungkan serangkaian stream dengan penanganan error dan backpressure otomatis |

### `Buffer.from(data, encoding?)`

Fungsi ini mengonversi data masukan ke dalam bentuk instance `Buffer`.

- `data` (string | Array | Buffer | ArrayBuffer, required): Data sumber yang disalin ke Buffer baru.
- `encoding` (string, optional, default `'utf8'`): Sistem pengkodean karakter jika `data` berupa string (misalnya `'utf8'`, `'hex'`, `'base64'`).
- **Returns:** `Buffer`, instance buffer baru berisi salinan byte dari data sumber.

```js
import { Buffer } from 'node:buffer';

const utf8Buf = Buffer.from('Node.js', 'utf8');
const base64Buf = Buffer.from('Tm9kZS5qcw==', 'base64');

console.log(utf8Buf.toString('hex'));
console.log(base64Buf.toString('utf8'));
// Output: 4e6f64652e6a73
// Output: Node.js
```

### `Buffer.alloc(size, fill?, encoding?)`

Fungsi ini mengalokasikan blok memori biner baru yang diinisialisasi bersih dengan kapasitas tertentu.

- `size` (number, required): Kapasitas buffer baru dalam satuan byte.
- `fill` (string | Buffer | number, optional, default `0`): Nilai awal untuk mengisi seluruh byte yang dialokasikan.
- `encoding` (string, optional, default `'utf8'`): Pengkodean teks jika nilai `fill` bertipe string.
- **Returns:** `Buffer`, instance buffer baru berukuran tetap.

```js
import { Buffer } from 'node:buffer';

const filledBuf = Buffer.alloc(5, 'A', 'utf8');
console.log(filledBuf.toString());
// Output: AAAAA
```

### `buffer.toString(encoding?, start?, end?)`

Metode ini mengurai data byte biner pada instance buffer menjadi string sesuai rentang indeks yang ditentukan.

- `encoding` (string, optional, default `'utf8'`): Format encoding karakter target.
- `start` (number, optional, default `0`): Indeks byte awal pembacaan.
- `end` (number, optional, default `buffer.length`): Indeks batas akhir pembacaan (eksklusif).
- **Returns:** string, teks representasi data byte.

```js
import { Buffer } from 'node:buffer';

const buf = Buffer.from('HelloWorld');
console.log(buf.toString('utf8', 0, 5));
// Output: Hello
```

### `pipeline(...streams, options?)`

Fungsi dari `node:stream/promises` ini mengalirkan potongan data antar beberapa stream secara berantai dengan pembersihan listener dan penanganan kegagalan otomatis.

- `...streams` (Stream[] | Iterable[] | AsyncIterable[], required): Deretan dua atau lebih stream yang dihubungkan secara sekuensial.
- `options` (object, optional): Opsi konfigurasi seperti `{ signal }` untuk pembatalan via `AbortSignal`.
- **Returns:** Promise<void>, selesai ketika seluruh stream sukses ditutup tanpa error.

```js
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const source = Readable.from(['chunk 1\n', 'chunk 2\n']);
const sink = new Writable({
  write(chunk, enc, cb) {
    process.stdout.write(chunk);
    cb();
  },
});

await pipeline(source, sink, { signal: AbortSignal.timeout(5000) });
// Output: chunk 1
// Output: chunk 2
```

## Examples

### 1. Transform Stream Pipeline

```js title="src/pipeline.mjs"
// run: node src/pipeline.mjs
import { Readable, Transform, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const sourceStream = Readable.from(['alpha\n', 'beta\n', 'gamma\n']);

const upperTransform = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  },
});

const output = [];
const destinationStream = new Writable({
  write(chunk, encoding, callback) {
    output.push(chunk.toString());
    callback();
  },
});

await pipeline(sourceStream, upperTransform, destinationStream);
console.log('Processed Stream Chunks:');
process.stdout.write(output.join(''));
// Output: Processed Stream Chunks:
// Output: ALPHA
// Output: BETA
// Output: GAMMA
```

## Real-World Use Case

**Backend**

**Masalah:** memproses berkas log raksasa berukuran 5 GB sekaligus dengan `readFile` menyebabkan server langsung kehabisan memori RAM (*heap out of memory*).
**Solusi:** alirkan data per baris menggunakan `Transform` stream dan `pipeline` dari `node:stream/promises` sehingga pemakaian memori tetap stabil di bawah 30 MB.

```js title="stream-logs.mjs"
import { Readable, Transform, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const logs = Readable.from(['warn: high load\n', 'error: db offline\n']);
const filter = new Transform({
  transform(chunk, enc, cb) {
    const text = chunk.toString();
    if (text.startsWith('error:')) cb(null, text);
    else cb();
  },
});

const output = [];
const destination = new Writable({
  write(chunk, enc, cb) {
    output.push(chunk.toString());
    cb();
  },
});

await pipeline(logs, filter, destination);
process.stdout.write(output.join(''));
// Output: error: db offline
```

## Pitfalls

- Menggunakan `Buffer.allocUnsafe()` tanpa pembersihan. Fungsi ini mengalokasikan memori tanpa inisialisasi nol, sehingga berisiko mengekspos data sensitif lama sistem.
  ```js
  // ❌ Incorrect: exposes uninitialized memory bytes
  const unsafeBuf = Buffer.allocUnsafe(10);

  // ✅ Correct: safely initialized with zero or fallback character
  const safeBuf = Buffer.alloc(10);
  console.log(safeBuf.every((byte) => byte === 0));
  // Output: true
  ```
- Menggunakan `.pipe()` bawaan tanpa error handler terpadu, yang memicu unhandled stream leak jika salah satu stream gagal di tengah jalan.
  ```js
  // ❌ Incorrect: pipe does not automatically clean up on error
  // readable.pipe(writable);

  // ✅ Correct: use stream/promises pipeline for auto-cleanup
  await pipeline(source, destination);
  ```

## References

- [Node.js Docs: Buffer](https://nodejs.org/api/buffer.html)
- [Node.js Docs: Stream](https://nodejs.org/api/stream.html)

---

Sebelumnya: [04 - Events](../04-events/README.md) | Berikutnya: [06 - Timers & Async](../06-timers-async/README.md)
