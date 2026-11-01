# 🚀 Panduan Belajar Node.js Lengkap (Learn Node.js)

Selamat datang di repositori dokumentasi belajar **Node.js** lengkap! Repositori ini menyajikan kurikulum terstruktur, mendalam, dan berbasis standar industri modern, mulai dari arsitektur internal runtime V8 & Libuv, Core Built-in Modules, manajemen paket NPM, otomatisasi pengujian unit Jest, enterprise logging Winston, validasi skema data Joi, ORM Prisma, hingga proyek nyata siap produksi.

Kurikulum disusun secara sistematis dalam **4 Fase Utama**:

1. **Fase 1: Runtime & Core Modules (_Built-in APIs_)** — Memahami single-thread event loop, arsitektur asinkron non-blocking, manipulasi biner (Buffer), aliran data efisien (Streams), manipulasi berkas (fs), jaringan (TCP/HTTP), serta pemanfaatan multi-core CPU (Worker Threads & Cluster).
2. **Fase 2: Ekosistem Paket & Otomasi Pengujian (_Tooling & Testing_)** — Manajemen ketergantungan paket dengan NPM/NPX, aturan semantic versioning (SemVer), pembuatan paket modular, serta otomasi pengujian unit komprehensif menggunakan Jest.
3. **Fase 3: Observabilitas, Validasi & Data Layer (_Production Backend_)** — Logging standar industri dengan Winston, sanitasi & validasi data dengan Joi, serta interaksi basis data modern menggunakan Prisma ORM.
4. **Fase 4: Penerapan Nyata (_Real-World Capstone Project_)** — Membangun aplikasi RESTful API utuh dengan pemisahan lapisan logika (Service Layer), spesifikasi API terstandarisasi, dan berkas pengujian HTTP siap eksekusi.

> 💡 **Catatan Ekosistem Web Framework:**
> Untuk materi lengkap pengembangan web service, routing, middleware pipeline, dan REST API menggunakan **Express.js**, silakan kunjungi repositori terpisah: **[learn-express](../learn-express/README.md)**.

---

## 📚 Daftar Isi dan Urutan Belajar

### 1. [01 - Node.js Core Modules & Runtime Architecture](01-core-modules/)

Fondasi runtime, arsitektur Libuv, dan API bawaan standar tanpa dependensi eksternal:

#### Materi Fondasi (01–12, Pelajari Berurutan)
1. [01 - Global Objects & Web Standards](01-core-modules/01-globals/README.md)
   - Objek global bawaan, `globalThis`, Web APIs (`structuredClone`, `performance`, `TextEncoder`, `AbortController`).
2. [02 - Process Lifecycle & Telemetry](01-core-modules/02-process/README.md)
   - Objek `process`, argumen CLI (`process.argv`), variabel lingkungan (`process.env`), dan metrik memori RAM.
3. [03 - Path Manipulation & Security](01-core-modules/03-path/README.md)
   - Normalisasi path file lintas platform (POSIX vs Windows), resolusi absolut, dan proteksi Path Traversal.
4. [04 - URL & Query String Resolution](01-core-modules/04-url/README.md)
   - Standar WHATWG URL API, parsing hostname/port/pathname, dan manipulasi parameter via `URLSearchParams`.
5. [05 - File System (fs/promises)](01-core-modules/05-file-system/README.md)
   - Manajemen file CRUD lengkap, scanning Dirent, atomic write pattern, dan kamus kode error sistem.
6. [06 - Events (EventEmitter)](01-core-modules/06-events/README.md)
   - Pola Event-Driven Architecture native, registrasi listener, penanganan error, dan mitigasi memory leak.
7. [07 - Buffer & Data Encoding](01-core-modules/07-buffer/README.md)
   - Penanganan data biner mentah di luar V8 heap, manipulasi byte, serta konversi UTF-8, Base64, dan Hex.
8. [08 - Stream & Backpressure Management](01-core-modules/08-stream/README.md)
   - Aliran data berkelanjutan (Readable, Writable, Transform), konsumsi memori hemat, dan modul `pipeline`.
9. [09 - Timer & Asynchronous Runtime](01-core-modules/09-timer/README.md)
   - Fase Event Loop Libuv, perbedaan macrotask vs microtask, dan penjadwalan via `node:timers/promises`.
10. [10 - HTTP Server & HTTP Client](01-core-modules/10-http/README.md)
    - Pembuatan HTTP server native, parsing header/body streaming, dan pemanggilan client request via `fetch()`.
11. [11 - Util (Standard Utility Functions)](01-core-modules/11-util/README.md)
    - Jembatan callback ke Promise (`util.promisify`), inspeksi objek mendalam, komparasi state, dan pewarnaan teks terminal.
12. [12 - Crypto (Kriptografi & Keamanan)](01-core-modules/12-crypto/README.md)
    - Pembuatan string acak aman, hashing SHA-256, HMAC, dan pencegahan timing attack.

#### Materi Pendukung (13–18, Pelajari Sesuai Kebutuhan)
13. [13 - OS (Operating System)](01-core-modules/13-os/README.md)
    - Informasi perangkat keras, arsitektur CPU, deteksi core prosesor (`availableParallelism`), dan memori RAM.
14. [14 - Worker Threads (Multi-Threaded Parallelism)](01-core-modules/14-worker-threads/README.md)
    - Eksekusi komputasi CPU berat di background thread tanpa memblokir Event Loop menggunakan modul `worker_threads`.
15. [15 - Zlib (Data Compression & Decompression)](01-core-modules/15-zlib/README.md)
    - Kompresi dan dekompresi data streaming berbasis algoritma Gzip, Deflate, dan Brotli.
16. [16 - Readline (Interactive Input & Line Streams)](01-core-modules/16-readline/README.md)
    - Pembacaan input interaktif baris demi baris dari terminal dan file stream via `readline/promises`.
17. [17 - Console & Custom Stream Logging](01-core-modules/17-console/README.md)
    - Pencetakan diagnostik, format tabular, dan pembuatan instance logger kustom ke file disk stream.
18. [18 - Child Process](01-core-modules/18-child-process/README.md)
    - Menjalankan perintah eksternal sistem operasi memakai fungsi `spawn` dan `exec`.

#### Materi Eksplorasi (19–23, Pelajari Saat Dibutuhkan)
19. [19 - Net (TCP Socket Networking)](01-core-modules/19-net/README.md)
    - Pemrograman jaringan tingkat rendah via TCP Server dan Client dua arah (*bidirectional socket stream*).
20. [20 - DNS (Domain Name System Resolution)](01-core-modules/20-dns/README.md)
    - Resolusi nama domain ke alamat IP mesin, perbedaan `dns.lookup` vs `dns.resolve`, dan query DNS record.
21. [21 - Cluster Module (Multi-Process Scaling)](01-core-modules/21-cluster/README.md)
    - Penskalaan multi-proses memanfaatkan seluruh core CPU dengan arsitektur Primary-Worker dan port sharing.
22. [22 - Diagnostic Report (`process.report`)](01-core-modules/22-report/README.md)
    - Pembuatan laporan diagnosa mendalam dalam format JSON untuk analisis crash dan investigasi memori.
23. [23 - Debugger & V8 Inspector](01-core-modules/23-debugger/README.md)
    - Titik henti terprogram `debugger;`, inspeksi nilai variabel runtime, dan integrasi V8 Inspector.

---

### 2. [02 - Package Management & Library Ecosystem](02-package-management/)

Ekosistem dependensi Node.js, pengelolaan proyek, dan siklus rilis library:

1. [01 - Package JSON & Scripts Automation](02-package-management/01-package-json-and-scripts/README.md)
   - Metadata proyek, registrasi script build/start, tipe modul CJS vs ESM, dan struktur `package-lock.json`.
2. [02 - Semantic Versioning & Dependencies Rule](02-package-management/02-dependencies-and-versioning/README.md)
   - Prinsip SemVer `MAJOR.MINOR.PATCH`, perbedaan caret (`^`), tilde (`~`), wildcard, dan devDependencies vs dependencies.
3. [03 - Menggunakan Third-Party Packages](02-package-management/03-third-party-packages/README.md)
   - Instalasi, integrasi, dan eksekusi pustaka eksternal populer seperti `lodash` dan `moment`.
4. [04 - Membangun & Publikasi Library NPM](02-package-management/04-publishing-npm-library/README.md)
   - Pembuatan paket kustom, konfigurasi `.npmignore`, entrypoint `main`, dan langkah publikasi ke NPM Registry.

---

### 3. [03 - Node.js Unit Testing with Jest](03-unit-test/)

Otomasi pengujian berbasis Jest dan Babel untuk menjamin stabilitas kode:

1. [01 - Jest Basics & Matchers](03-unit-test/01-jest-basics-and-matchers/README.md)
   - Struktur pengujian `describe`/`test`/`it`, equality matchers (`toBe`, `toEqual`), truthiness, numbers, strings, dan arrays.
2. [02 - Exception & Asynchronous Testing](03-unit-test/02-exceptions-and-async-test/README.md)
   - Pengujian kode yang melempar galat (`toThrow`), pengujian Promise, `async/await`, dan handling kegagalan terencana.
3. [03 - Scoping, Setup & Teardown Lifecycle](03-unit-test/03-setup-and-teardown/README.md)
   - Siklus hidup hook pengujian: `beforeEach`, `afterEach`, `beforeAll`, `afterAll`, dan isolasi cakupan blok.
4. [04 - Test Filtering & Parameterized Testing](03-unit-test/04-filtering-and-parameterized/README.md)
   - Filter eksekusi test (`test.only`, `test.skip`, `test.todo`), pengujian berbasis tabel parameter (`test.each`), dan konkurensi.
5. [05 - Mocking & Spying](03-unit-test/05-mocking/README.md)
   - Isolasi ketergantungan dengan `jest.fn()`, pemeriksaan pemanggilan (`toHaveBeenCalled`), implementasi mock, dan return values.

---

### 4. [04 - Production Logging with Winston](04-logging/)

Observabilitas aplikasi backend, hierarki log level, dan manajemen berkas log:

1. [01 - Winston Basics & Log Levels](04-logging/01-winston-basics-and-levels/README.md)
   - Pembuatan instance logger, standar RFC5424 log level (error, warn, info, http, verbose, debug, silly).
2. [02 - Transports & Log Formatting](04-logging/02-transports-and-formats/README.md)
   - Output log ke konsol vs berkas, formatur custom (`json`, `timestamp`, `colorize`, `printf`), dan komposit format.
3. [03 - File Transport & Daily Rotate Log](04-logging/03-file-and-daily-rotate/README.md)
   - Rotasi berkas log otomatis per hari menggunakan `winston-daily-rotate-file` untuk mencegah kehabisan kapasitas disk.
4. [04 - Exception & Rejection Handlers](04-logging/04-exception-and-rejections/README.md)
   - Penangkapan otomatis galat tak tertangani (`uncaughtException` & `unhandledRejection`) ke berkas log khusus.

---

### 5. [05 - Schema Data Validation with Joi](05-validation/)

Validasi ketat skema payload HTTP untuk integritas data dan keamanan aplikasi:

1. [01 - Joi Basics & Schema Definition](05-validation/01-joi-basics-and-schema/README.md)
   - Mendefinisikan aturan skema, eksekusi validasi (`schema.validate`), penanganan error validasi, dan sanitasi nilai.
2. [02 - Primitive Types & Date Validation](05-validation/02-primitive-and-date/README.md)
   - Validasi string, numeric bounds, boolean format, dan parsing tanggal valid.
3. [03 - Nested Objects & Array Validation](05-validation/03-nested-objects-and-arrays/README.md)
   - Validasi struktur objek berlapis, array of objects, panjang minimum/maksimum array, dan elemen unik.
4. [04 - Custom Validation Rules & Messages](05-validation/04-custom-validators-and-messages/README.md)
   - Membuat fungsi validasi khusus kustom (`custom()`) dan lokalisasi pesan kesalahan user-friendly.

---

### 6. [06 - Modern Database Persistence with Prisma ORM](06-database-prisma/)

Interaksi basis data modern, type-safe, dan declarative schema menggunakan Prisma ORM:

1. [01 - Prisma Setup & Schema Modelling](06-database-prisma/01-prisma-setup-and-schema/README.md)
   - Konfigurasi generator client, datasource PostgreSQL/MySQL, pemodelan tabel, dan migrasi skema deklaratif.
2. [02 - Prisma Client & Connection Pool](06-database-prisma/02-client-and-connection/README.md)
   - Inisialisasi singleton instance Prisma Client, lifecycle koneksi (`$connect`/`$disconnect`), dan logging query.
3. [03 - Raw SQL & Tagged Template Queries](06-database-prisma/03-raw-sql-and-queries/README.md)
   - Eksekusi query SQL mentah menggunakan `$queryRaw` dan `$executeRaw` dengan proteksi SQL Injection otomatis.

---

### 7. [Projects (Aplikasi & Implementasi Nyata)](projects/)

Proyek implementasi nyata yang menggabungkan seluruh konsep teori:

1. **[Todolist RESTful API Server](projects/todolist-rest-api/README.md)** (Capstone REST API):
   - **Teknologi**: Node.js Native HTTP Server, ES Modules (`.mjs`), Service-Layer Architecture, JSON Data Protocol.
   - **Fitur Utama**: Operasi CRUD Lengkap (Create, Read, Update, Delete) Todo item, RESTful URL routing, pengujian request via VS Code REST Client (`test.http`), dan spesifikasi dokumentasi API (`apidoc.md` & `apidoc.json`).

---

## 🛠️ Cara Menjalankan Kode

### 1. Menjalankan Modul Core Node.js (Fase 1)

```bash
# Menjalankan modul Process
node 01-core-modules/02-process/src/main.mjs

# Menjalankan manipulasi Buffer
node 01-core-modules/07-buffer/src/main.mjs

# Menjalankan File System I/O
node 01-core-modules/05-file-system/src/main.mjs

# Menjalankan Native HTTP Server
node 01-core-modules/10-http/src/main.mjs
```

### 2. Menjalankan Pengujian Unit Jest (Fase 2)

```bash
cd 03-unit-test
npm install
npm test                      # Menjalankan seluruh test suite dengan laporan coverage
npm test -- test/sum.test.js  # Menjalankan spesifik test matcher
```

### 3. Menjalankan Modul Logging Winston (Fase 3)

```bash
cd 04-logging
npm install
npm test                      # Menjalankan pengujian konfigurasi Winston logger
```

### 4. Menjalankan Validasi Joi & Prisma ORM (Fase 3)

```bash
# Modul Joi:
cd 05-validation
npm install
npm test

# Modul Prisma:
cd 06-database-prisma
npm install
npx prisma generate
npm test
```

### 5. Menjalankan Proyek Todolist REST API (Fase 4)

```bash
cd projects/todolist-rest-api
node app.mjs
# Server aktif pada port 3000. Buka file test.http untuk mengeksekusi request!
```
