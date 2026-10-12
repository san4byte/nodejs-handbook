# 📘 Modul 06: Modern Database Persistence with Prisma ORM

Selamat datang di **Modul 06**! Modul ini membahas secara mendalam teknik persistensi data modern, deklaratif, dan aman menggunakan **Prisma ORM** (Object-Relational Mapping). Mulai dari pemodelan skema deklaratif, generator client, migrasi basis data, koneksi connection pool, hingga eksekusi Raw SQL berbasis Tagged Template yang kebal dari celah SQL Injection.

---

## 📚 Daftar Materi Pembelajaran

1. [01 - Prisma Setup & Schema Modelling](01-prisma-setup-and-schema/README.md)
   - Konfigurasi generator client, deklarasi datasource (MySQL/PostgreSQL), pemodelan entitas `model`, dan migrasi basis data deklaratif (`prisma migrate`).
2. [02 - Prisma Client & Connection Pool](02-client-and-connection/README.md)
   - Inisialisasi singleton PrismaClient, konfigurasi log query (`log: ['query', 'info', 'warn', 'error']`), format error (`errorFormat: 'pretty'`), dan lifecycle koneksi.
3. [03 - Raw SQL & Tagged Template Queries](03-raw-sql-and-queries/README.md)
   - Konsep Tagged Template Literal JavaScript, eksekusi query DML via `$executeRaw`, pembacaan data via `$queryRaw`, dan pencegahan mutlak serangan SQL Injection.

---

## 🛠️ Cara Menjalankan

Masuk ke direktori modul ini, pasang dependensi, lalu lakukan sinkronisasi client Prisma:

```bash
cd 06-database-prisma
npm install

# Menghasilkan Prisma Client berdasarkan schema.prisma:
npx prisma generate

# Menjalankan migrasi database ke server MySQL lokal:
npx prisma migrate dev

# Menjalankan unit test pengujian query:
npm test -- test/tag-function.test.js
npm test -- test/execute-sql.test.js
npm test -- test/query-sql.test.js
```

---

## 🧭 Navigasi

- ⬅️ **Modul Sebelumnya:** [05 - Schema Data Validation with Joi](../05-validation/README.md)
- ➡️ **Modul Selanjutnya:** [Projects (Real-World Implementation)](../projects/README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../README.md)
