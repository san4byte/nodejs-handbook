# 02 - Prisma Client & Connection Pool

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Menginisialisasi instans `PrismaClient` sebagai jembatan tunggal (_Singleton_) antara aplikasi Node.js dengan connection pool database, mengelola siklus koneksi (`$connect` dan `$disconnect`), serta mengonfigurasi logging eksekusi query SQL mentah.
> - **Kapan Digunakan**: Digunakan sebagai modul database inti di seluruh service layer backend untuk menjalankan operasi CRUD (Create, Read, Update, Delete) yang type-safe.
> - **Aturan Praktis**: Buat satu instans `PrismaClient` tunggal di seluruh aplikasi (pola Singleton). Jangan pernah membuat `new PrismaClient()` berulang kali di setiap controller atau route karena akan menghabiskan kuota koneksi database pool (_Database Connection Exhaustion_).

---

## 1. 🎯 Tujuan Belajar

- Memahami cara kerja Prisma Client sebagai database client otomatis berbasis hasil generate skema.
- Mengonfigurasi opsi logging kustom: `log: ['query', 'info', 'warn', 'error']` untuk memantau performa dan SQL mentah yang dieksekusi.
- Mengatur format tampilan galat database yang mudah dibaca pengembang (`errorFormat: 'pretty'`).
- Mengelola siklus hidup koneksi basis data: metode eksplisit `$connect()` dan graceful shutdown `$disconnect()`.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan Prisma Client seperti **stasiun pompa air kota**:
>
> - Pipa-pipa air yang terhubung ke sumur induk (koneksi fisik MySQL) memiliki kapasitas terbatas (Connection Pool).
> - **`PrismaClient` (Singleton)** adalah **stasiun pompa terpadu**: mengalirkan air ke ribuan rumah warga (request HTTP) secara bergantian dan efisien dari pipa yang sama.
> - Jika setiap rumah warga membangun stasiun pompanya sendiri-sendiri (`new PrismaClient()` di setiap controller), sumur induk akan langsung kehabisan tekanan air dan sistem pompa kota akan macet seketika (_Too many connections_).

---

### Inisialisasi Singleton Instance Prisma Client

```javascript
// src/prisma-client.js
import { PrismaClient } from '@prisma/client';

export const prismaClient = new PrismaClient({
  errorFormat: 'pretty',
  log: ['query', 'info', 'warn', 'error']
});
```

---

### Metode Siklus Hidup PrismaClient

| Metode | Fungsi | Catatan Penting |
| :--- | :--- | :--- |
| `prismaClient.$connect()` | Membuka koneksi awal ke database secara eksplisit | Opsional (Prisma otomatis malas/lazy menghubungkan saat query pertama dijalankan) |
| `prismaClient.$disconnect()` | Menutup seluruh connection pool secara bersih | **Wajib dipanggil** saat aplikasi dimatikan atau di akhir test suite |
| `prismaClient.$on('query', fn)` | Menangkap event query dan durasi eksekusinya | Sangat berguna untuk mendeteksi slow query di terminal |

---

### Pembahasan Mendalam Fitur

#### 1. Memantau SQL Mentah yang Dieksekusi

Dengan menyetel opsi `log: ['query']`, setiap kali Anda memanggil metode Prisma, query SQL yang dikirim ke database akan tercetak di konsol beserta parameter dan durasi eksekusinya:

```text
prisma:query SELECT `sampel`.`id`, `sampel`.`name` FROM `sampel` WHERE 1=1 LIMIT 1
```

#### 2. Graceful Shutdown Koneksi Basis Data

```javascript
import process from 'node:process';
import { prismaClient } from './src/prisma-client.js';

async function cleanup() {
  console.log('Menutup koneksi pool Prisma...');
  await prismaClient.$disconnect();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas praktik pada subtopik ini:
- [`src/prisma-client.js`](../src/prisma-client.js): Inisialisasi instance Prisma Client dengan logging query dan error formatting.
- [`test/prisma-client.test.js`](../test/prisma-client.test.js): Pengujian lifecycle pembukaan dan penutupan koneksi via `$connect()` dan `$disconnect()`.

Jalankan test terkait secara langsung di terminal Anda:

```bash
cd 07-database-prisma
npm test -- test/prisma-client.test.js
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Mengukur Durasi Eksekusi Query Lambat (Slow Query Profiling)

```javascript
import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' }
  ]
});

db.$on('query', (e) => {
  if (e.duration > 100) { // Query lebih dari 100 milidetik
    console.warn(`[SLOW QUERY DETECTED] (${e.duration}ms): ${e.query}`);
  }
});
```

### ⚠️ Common Pitfalls

- **Lupa Menutup Koneksi di Jest Test Suite**: Jika `prismaClient.$disconnect()` tidak dipanggil di blok `afterAll()`, proses runner Jest akan menggantung (_hang_) di terminal karena koneksi TCP socket ke database masih terbuka.
- **Membuat Instans Prisma Baru di Setiap File Module**: Selalu impor `prismaClient` dari satu file sentral singleton.

### 🌟 Best Practice

- **Gunakan Variabel Lingkungan `.env` untuk Kredensial**: Jangan pernah menuliskan username dan password database secara hardcoded di dalam berkas konfigurasi JavaScript.

---

## 5. ✍️ Latihan Mandiri

1. Konfigurasikan listener `$on('query')` untuk mencetak string query dan durasi eksekusi dalam format tabel.
2. Tulis test Jest yang memastikan `$connect()` berhasil tersambung ke database test Anda tanpa melempar exception.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [01 - Prisma Setup & Schema Modelling](../01-prisma-setup-and-schema/README.md)
- ➡️ **Selanjutnya:** [03 - Raw SQL & Tagged Template Queries](../03-raw-sql-and-queries/README.md)
- 🏠 **Daftar Isi Modul 07:** [README Modul 07](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

