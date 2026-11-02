# Logging

> Membangun sistem logging berstandar produksi seperti Winston atau Pino dari nol, memanfaatkan WritableStream, format JSON terstruktur, dan rotasi file harian.

## Core Concepts

- Logging ke `console.log` secara langsung bersifat sinkron dan memblokir Event Loop pada volume lalu lintas tinggi.
- Standar industri mensyaratkan format log terstruktur (JSON) dengan metadata ISO timestamp, level keparahan, dan context info agar mudah diurai oleh sistem agregasi sentral.
- Hierarki Log Level RFC5424: `error` (0) > `warn` (1) > `info` (2) > `debug` (3).
- Rotasi berkas mencegah kehabisan kapasitas penyimpanan server (*disk exhaustion*).

## Referensi

Daftar kelas dan properti sistem logging:

| API / Fitur | Fungsi |
|---|---|
| `new Logger(options?)` | Membuat instance logger dengan konfigurasi level, format, dan transports |
| `logger.info(message, meta?)` | Mencatat pesan status level info beserta metadata konteks |
| `new DailyRotateFileTransport(baseDir, prefix?)` | Transport yang menulis berkas log harian otomatis berbasis tanggal |

### `new Logger(options?)`

Kelas ini mengelola alur pencatatan, pemfilteran level, dan distribusi pesan log ke berbagai media transport.

- `options` (LoggerOptions, optional): Objek konfigurasi logger:
  - `level` (string, optional, default `'info'`): Ambang batas level log (`'error'`, `'warn'`, `'info'`, `'debug'`).
  - `format` ((info: object) => string, optional, default `formats.json`): Fungsi formatter yang mengubah objek log menjadi teks terstruktur.
  - `transports` (Transport[], optional): Daftar media tujuan penulisan log (console, file harian).
- **Returns:** `Logger`, instance pencatat log terpusat.

```js
import { Logger } from './src/logger.mjs';
import { formats } from './src/formats.mjs';
import { ConsoleTransport } from './src/transports.mjs';

const logger = new Logger({
  level: 'debug',
  format: formats.json,
  transports: [new ConsoleTransport()],
});
```

### `logger.info(message, meta?)`

Metode ini mencatat rekaman status level informasi (tersedia juga `.error()`, `.warn()`, `.debug()`).

- `message` (string, required): Kalimat pesan deskripsi aktivitas sistem.
- `meta` (Record<string, any>, optional): Objek data konteks tambahan (seperti `userId`, `ip`, `durationMs`).
- **Returns:** void.

```js
logger.info('User authentication succeeded', {
  userId: 'usr-441',
  authMethod: 'oauth2',
});
// Output: {"timestamp":"...","level":"info","message":"User authentication succeeded","userId":"usr-441","authMethod":"oauth2"}
```

### `new DailyRotateFileTransport(baseDir, prefix?)`

Transport ini menulis data log ke file disk dan otomatis mengganti file saat tanggal kalender berganti.

- `baseDir` (string, required): Direktori penyimpanan berkas log rotasi.
- `prefix` (string, optional, default `'app'`): Awalan nama berkas log harian (`${baseDir}/${prefix}-YYYY-MM-DD.log`).
- **Returns:** `DailyRotateFileTransport`, instance transport berbasis stream file disk harian.

```js
import { DailyRotateFileTransport } from './src/rotate.mjs';

const transport = new DailyRotateFileTransport('./logs/audit', 'security');
```

## Examples

### 1. Inisialisasi dan Pencatatan Log

```js title="example-logger.mjs"
import { Logger } from './src/logger.mjs';
import { formats } from './src/formats.mjs';

const logger = new Logger({
  level: 'info',
  format: formats.json,
});

logger.info('System online', { port: 8080 });
// Output: {"timestamp":"...","level":"info","message":"System online","port":8080}
```

## Real-World Use Case

**Backend**

**Masalah:** hard disk server produksi penuh dan server crash mendadak karena log aplikasi terus ditulis ke satu file `app.log` selama berbulan-bulan tanpa rotasi.
**Solusi:** alirkan log ke transport `DailyRotateFileTransport` yang otomatis memecah berkas harian (`app-YYYY-MM-DD.log`).

```js title="rotate-logger.mjs"
import { Logger } from './src/logger.mjs';
import { DailyRotateFileTransport } from './src/rotate.mjs';

const rotateTransport = new DailyRotateFileTransport('./logs/demo', 'app');
const logger = new Logger({ transports: [rotateTransport] });

logger.info('Transaction processed', { orderId: 'ORD-777' });
await rotateTransport.close();
console.log('Daily log successfully written to disk.');
// Output: Daily log successfully written to disk.
```

## Pitfalls

- Menggunakan `console.log` mentah di server produksi, yang tidak menghasilkan struktur JSON terstandarisasi dan membebani throughput I/O sinkron.
  ```js
  // ❌ Incorrect: unstructured and cannot be filtered by environment log level
  // console.log('user logged in', userId);

  // ✅ Correct: structured JSON logging with level threshold
  logger.info('User session opened', { userId: 'usr-123' });
  ```
- Menutup aplikasi tanpa menutup stream transport file, yang dapat memotong log terakhir yang belum ter-flush ke disk.
  ```js
  // ❌ Incorrect: abrupt process exit drops buffered logs
  // process.exit(0);

  // ✅ Correct: await transport close before exit
  await rotateTransport.close();
  ```

## References

- [Node.js Docs: Writable Stream](https://nodejs.org/api/stream.html#writable-streams)

---

Sebelumnya: [04 - Testing](../04-testing/README.md) | Berikutnya: [06 - Database](../06-database/README.md)
