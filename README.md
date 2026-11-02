# Panduan Belajar Node.js Ringkas

> Repositori panduan belajar dan dokumentasi modular **Node.js** modern berbasis standar LTS. Seluruh kurikulum berfokus pada pemahaman fundamental internal runtime V8 & Libuv, arsitektur murni, dan rekayasa komponen dari nol (*build from scratch*) tanpa ketergantungan library pihak ketiga.

## Peta Kurikulum Belajar

| No | Modul Utama | Cakupan Materi | Tautan |
|---|---|---|---|
| **01** | **Core Modules** | 12 modul bawaan esensial: `process`, `path`, `fs`, `events`, `stream`, `timers`, `http`, `crypto`, `zlib`, `worker_threads`, `child_process`, dan `util/os`. | [01-core-modules/](01-core-modules/README.md) |
| **02** | **Package Management** | Ekosistem NPM, manifest `package.json`, aturan SemVer, audit keamanan dependensi, dan rilis library. | [02-package-management/](02-package-management/README.md) |
| **03** | **Validation** | Membangun engine validasi data skema berbasis fungsi murni dan class chainable sebagai pengganti Joi/Zod. | [03-validation/](03-validation/README.md) |
| **04** | **Testing** | Membangun test runner, assertion library (`expect`), lifecycle hooks, dan mock function dari nol sebagai pengganti Jest. | [04-testing/](04-testing/README.md) |
| **05** | **Logging** | Membangun logger berstandar produksi dengan format JSON terstruktur, WritableStream, dan rotasi file harian. | [05-logging/](05-logging/README.md) |
| **06** | **Database** | Membangun basis data dokumen JSON dengan atomic write, antrean lock konkurensi, dan Write-Ahead Log (WAL). | [06-database/](06-database/README.md) |
| - | **Projects** | Aplikasi nyata RESTful API (Todolist Server) yang menggabungkan seluruh modul fundamental di atas. | [projects/](projects/README.md) |

---

## Prinsip Kurikulum

1. **Zero-Dependency Focus:** Mempelajari cara kerja internal sistem operasi dan runtime sebelum berpindah ke framework tingkat tinggi (Express, NestJS, Prisma).
2. **Standard & Modern:** Mengadopsi standar modern Node.js LTS (ES Modules, prefiks `node:`, `fetch` native, `util.styleText`, dan `node:test`).
3. **Dokumentasi Ringkas:** Setiap materi dirancang ringkas (80–140 baris), menyajikan tabel referensi API lengkap di awal, dan menyatukan output langsung di dalam blok kode.
