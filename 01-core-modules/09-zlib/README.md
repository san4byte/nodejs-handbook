# Zlib (Kompresi & Dekompresi)

> Modul `node:zlib` menyediakan algoritma kompresi data lossless bawaan seperti Gzip, Deflate, dan Brotli untuk menghemat bandwidth transfer jaringan dan kapasitas penyimpanan berkas.

## Core Concepts

- Kompresi mengurangi ukuran byte payload teks (JSON, HTML) hingga 70–80%.
- Brotli (`brotliCompress`) memberikan rasio kompresi lebih tinggi daripada Gzip, namun membutuhkan siklus CPU lebih besar saat kompresi awal.
- Semua modul zlib dapat beroperasi secara asinkron berbasis callback/Promise atau sebagai `Transform` stream dalam `pipeline()`.
- Selalu periksa ekstensi data sebelum mengompresi; data multimedia yang sudah terkompresi tidak akan mengecil.

## Referensi

Daftar fungsi kompresi dan dekompresi modul `node:zlib` yang sering digunakan:

| API / Fitur | Fungsi |
|---|---|
| `zlib.gzip(buffer, options?, callback)` | Mengompresi buffer data menggunakan algoritma Gzip dengan opsi level |
| `zlib.gunzip(buffer, options?, callback)` | Mendekompresi buffer data Gzip kembali ke format aslinya |
| `zlib.createGzip(options?)` | Membuat Transform stream untuk kompresi data Gzip bertahap |

### `zlib.gzip(buffer, options?, callback)`

Fungsi ini mengompresi chunk buffer atau string menggunakan algoritma Gzip standar.

- `buffer` (Buffer | string | DataView, required): Data sumber yang akan dikompresi.
- `options` (ZlibOptions, optional): Opsi kompresi seperti `level` (number 1-9, default `6`) dan `chunkSize` (number).
- `callback` ((error: Error | null, result: Buffer) => void, optional): Fungsi penerima buffer hasil kompresi (menghasilkan Promise<Buffer> bila dibungkus `promisify`).
- **Returns:** void (atau Promise<Buffer> jika dipromisify).

```js
import zlib from 'node:zlib';
import { promisify } from 'node:util';

const gzip = promisify(zlib.gzip);
const compressed = await gzip(Buffer.from('Hello world payload'), { level: 6 });
console.log('Compressed bytes:', compressed.length);
// Output: Compressed bytes: 39
```

### `zlib.gunzip(buffer, options?, callback)`

Fungsi ini mendekompresi buffer data biner yang sebelumnya dikompresi dengan Gzip.

- `buffer` (Buffer | string | DataView, required): Data biner terkompresi Gzip yang akan diekstrak.
- `options` (ZlibOptions, optional): Opsi konfigurasi dekompresi seperti batas buffer alokasi memori.
- `callback` ((error: Error | null, result: Buffer) => void, optional): Callback penerima buffer hasil dekompresi.
- **Returns:** void (atau Promise<Buffer> jika dipromisify).

```js
import zlib from 'node:zlib';
import { promisify } from 'node:util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const compressed = await gzip(Buffer.from('Restore me'));
const decompressed = await gunzip(compressed);
console.log(decompressed.toString());
// Output: Restore me
```

### `zlib.createGzip(options?)`

Fungsi ini menghasilkan instance `Transform` stream yang mengompresi setiap chunk data yang dialirkan melaluinya secara bertahap.

- `options` (ZlibOptions, optional): Opsi konfigurasi stream seperti `level` (number 1-9) dan `windowBits`.
- **Returns:** `Gzip`, instance Transform stream untuk integrasi pipeline I/O.

```js
import zlib from 'node:zlib';

const gzipStream = zlib.createGzip({ level: 6 });
console.log('Stream writable:', gzipStream.writable);
// Output: Stream writable: true
```

## Examples

### 1. Kompresi Gzip dan Brotli

```js title="src/gzip.mjs"
// run: node src/gzip.mjs
import zlib from 'node:zlib';
import { promisify } from 'node:util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);
const brotliCompress = promisify(zlib.brotliCompress);
const brotliDecompress = promisify(zlib.brotliDecompress);

const sampleText = 'Node.js Handbook Compression '.repeat(14);
const compressedGzip = await gzip(Buffer.from(sampleText));
const decompressedGzip = await gunzip(compressedGzip);
const compressedBrotli = await brotliCompress(Buffer.from(sampleText));
const decompressedBrotli = await brotliDecompress(compressedBrotli);

console.log('Original size (bytes):', Buffer.from(sampleText).length);
// Output: Original size (bytes): 406
console.log('Gzip compressed size:', compressedGzip.length);
// Output: Gzip compressed size: 54
console.log('Gzip decompressed matches:', decompressedGzip.toString() === sampleText);
// Output: Gzip decompressed matches: true
console.log('Brotli compressed size:', compressedBrotli.length);
// Output: Brotli compressed size: 33
console.log('Brotli decompressed matches:', decompressedBrotli.toString() === sampleText);
// Output: Brotli decompressed matches: true
```

## Real-World Use Case

**Backend**

**Masalah:** endpoint REST API mengirim payload JSON analitik sebesar 1 MB yang memperlambat rendering aplikasi pada koneksi seluler.
**Solusi:** kompresi response stream menggunakan Gzip melalui `pipeline` dan tambahkan header HTTP `Content-Encoding: gzip`.

```js title="gzip-server.mjs"
import http from 'node:http';
import zlib from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const server = http.createServer(async (req, res) => {
  const payload = JSON.stringify({ data: Array(100).fill('analytics-metric') });

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Encoding': 'gzip',
  });

  await pipeline(Readable.from(payload), zlib.createGzip({ level: 6 }), res);
});

server.listen(0, async () => {
  const { port } = server.address();
  const res = await fetch(`http://localhost:${port}`);
  const text = await res.text();
  console.log('Decompressed successfully:', text.includes('analytics-metric'));
  // Output: Decompressed successfully: true
  server.close();
});
```

## Pitfalls

- Mengompresi kembali aset gambar atau arsip biner (seperti `.png`, `.jpg`, `.zip`) yang sudah terkompresi. Hal ini hanya membuang siklus CPU dan dapat memperbesar ukuran file.
  ```js
  // ❌ Incorrect: compressing already compressed media files
  // const compressedImg = await gzip(jpegBuffer);

  // ✅ Correct: only compress compressible text formats
  function shouldCompress(contentType) {
    return /json|text|javascript|css|xml/.test(contentType);
  }
  console.log('Compress JSON:', shouldCompress('application/json'));
  // Output: Compress JSON: true
  console.log('Compress JPEG:', shouldCompress('image/jpeg'));
  // Output: Compress JPEG: false
  ```
- Menggunakan level kompresi maksimum (`level: 9`) secara membabi-buta untuk seluruh respons realtime HTTP, yang membebani CPU secara tidak proporsional.
  ```js
  // ❌ Incorrect: extreme CPU latency for marginal size gains
  // zlib.createGzip({ level: 9 });

  // ✅ Correct: balanced default level 6 for high throughput
  const balancedGzip = zlib.createGzip({ level: 6 });
  ```

## References

- [Node.js Docs: Zlib](https://nodejs.org/api/zlib.html)

---

Sebelumnya: [08 - Crypto](../08-crypto/README.md) | Berikutnya: [10 - Worker & Cluster](../10-worker-cluster/README.md)
