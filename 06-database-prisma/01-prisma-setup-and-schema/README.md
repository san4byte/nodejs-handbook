# 01 - Prisma Setup & Schema Modelling

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Mendefinisikan struktur model tabel basis data relasional secara deklaratif di dalam satu berkas `schema.prisma`, serta melakukan sinkronisasi otomatis ke basis data fisik menggunakan `prisma migrate dev`.
> - **Kapan Digunakan**: Langkah pertama saat merancang skema basis data baru atau melakukan penambahan kolom/tabel baru pada aplikasi backend.
> - **Aturan Praktis**: Selalu simpan URL koneksi basis data di berkas `.env` (`DATABASE_URL="mysql://user:pass@localhost:3306/db_name"`). Jangan pernah mengedit berkas SQL migrasi yang sudah pernah di-push ke branch utama.

---

## 1. 🎯 Tujuan Belajar

- Menguasai anatomi berkas `schema.prisma`: blok `generator`, blok `datasource`, dan blok `model`.
- Memahami tipe data deklaratif Prisma: `String`, `Int`, `Boolean`, `DateTime`, `Json`, dan relasi antar tabel.
- Menentukan primary key (`@id`), nilai default (`@default()`), dan nilai unik (`@unique`).
- Menjalankan alur migrasi database otomatis: `npx prisma migrate dev --name <nama_migrasi>`.
- Menghasilkan tipe TypeScript / JavaScript client via `npx prisma generate`.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan Prisma Schema & Migrasi seperti **cetak biru arsitek & kontraktor bangunan**:
>
> - **`schema.prisma`** adalah **gambar denah arsitektur**: menentukan di mana letak pilar utama (`@id`), dinding penyekat, dan jenis keramik lantai (`String`, `Int`).
> - **`npx prisma migrate`** adalah **kontraktor bangunan**: membaca denah arsitek dan langsung mengecor semen fisik di lapangan (membuat tabel SQL `CREATE TABLE` di MySQL/PostgreSQL).
> - Setiap perubahan denah dicatat rapi dalam buku riwayat pembangunan (`migrations/`), sehingga bangunan dapat dibangun ulang persis sama di tempat lain kapan saja.

---

### Struktur Berkas `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql" // Mendukung: mysql, postgresql, sqlite, sqlserver
  url      = env("DATABASE_URL")
}

model Sampel {
  id   String @id
  name String
}
```

---

### Perintah Utama Prisma CLI

| Perintah Terminal | Fungsi & Kapan Digunakan |
| :--- | :--- |
| `npx prisma init` | Menginisialisasi folder `prisma/` dan berkas `.env` |
| `npx prisma migrate dev` | Menghitung perbedaan skema, membuat berkas `.sql`, dan menerapkannya ke DB dev |
| `npx prisma migrate deploy`| Menerapkan seluruh antrean migrasi SQL ke basis data production |
| `npx prisma generate` | Mengompilasi dan menghasilkan file binary JavaScript/TypeScript Prisma Client |
| `npx prisma studio` | Membuka antarmuka GUI visual di peramban untuk melihat/mengedit data tabel secara langsung |

---

## 3. 💻 Kode Praktik Terpadu

Berkas skema dan migrasi pada subtopik ini:
- [`schema.prisma`](../prisma/schema.prisma): Deklarasi model entitas `Sampel` dengan konektor database MySQL.
- [`migration.sql`](../prisma/migrations/20241023122702_create_db_sampel/migration.sql): Berkas SQL migrasi hasil kompilasi otomatis Prisma.

Jalankan generator client di terminal Anda:

```bash
cd 07-database-prisma
npx prisma generate
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Mengelola Skema Model Relasi One-to-Many

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
}
```

### ⚠️ Common Pitfalls

- **Mengubah Kolom Menjadi `required` pada Tabel yang Sudah Berisi Jutaan Baris Data**: Jika Anda menambahkan kolom baru `phone String` tanpa `@default()` pada tabel lama, migrasi akan gagal karena baris yang sudah ada tidak memiliki nilai default.
- **Lupa Menjalankan `prisma generate` Setelah Mengubah Skema**: Objek `prismaClient` tidak akan mengenali model atau kolom baru sebelum perintah generate dijalankan.

### 🌟 Best Practice

- **Gunakan Penamaan Model Singular (Tunggal) PascalCase**: Biasakan menamai model secara tunggal seperti `User` atau `Product`, bukan `Users` atau `Products`, karena Prisma otomatis menangani representasi jamak di relasinya.

---

## 5. ✍️ Latihan Mandiri

1. Tambahkan properti `description String?` (opsional) dan `createdAt DateTime @default(now())` pada model `Sampel`.
2. Jalankan `npx prisma format` untuk merapikan indentasi berkas `schema.prisma`.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [04 - Custom Validation Rules & Messages](../../05-validation/04-custom-validators-and-messages/README.md)
- ➡️ **Selanjutnya:** [02 - Prisma Client & Connection Pool](../02-client-and-connection/README.md)
- 🏠 **Daftar Isi Modul 06:** [README Modul 06](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

