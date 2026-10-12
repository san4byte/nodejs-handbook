# 03 - Raw SQL & Tagged Template Queries

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Mengeksekusi query database SQL mentah secara fleksibel menggunakan metode `$queryRaw` (untuk operasi DQL `SELECT`) dan `$executeRaw` (untuk operasi DML `INSERT`, `UPDATE`, `DELETE`) dengan proteksi injeksi SQL mutlak melalui fitur Native JavaScript **Tagged Template Literals**.
> - **Kapan Digunakan**: Digunakan saat membutuhkan query analitik kompleks, agregasi multi-tabel rumit yang sulit diungkapkan via API ORM biasa, atau operasi performa tinggi (_bulk processing_).
> - **Aturan Praktis**: Gunakan selalu format template literal dengan backtick: `prismaClient.$queryRaw\`SELECT ... WHERE id = ${id}\``. Jangan pernah melakukan konkatenasi string manual biasa (`$queryRawUnsafe`), karena template literal Prisma otomatis mengonversi variabel `${...}` menjadi _Parameterized Prepared Statement_ yang kebal SQL Injection.

---

## 1. 🎯 Tujuan Belajar

- Memahami konsep **Tagged Template Literal** di JavaScript modern: bagaimana sebuah fungsi dapat membedah string statis dan argumen dinamis ke dalam array terpisah.
- Mengetahui mengapa injeksi SQL berbahaya terjadi (pemisahan antara instruksi SQL dan data pengguna).
- Mengeksekusi perintah modifikasi data (DML) via `$executeRaw` dan membaca jumlah baris yang terdampak (_impacted rows_).
- Mengeksekusi perintah pembacaan data (DQL) via `$queryRaw` dan memetakan hasilnya ke array objek JavaScript.
- Memahami perbedaan krusial antara `$queryRaw` (Aman) vs `$queryRawUnsafe` (Rawan celah).

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan Tagged Template Literal seperti **sistem formulir bank dengan kotak isian terisolasi**:
>
> - **Konkatenasi String Biasa (Rentan Injeksi)** ibarat Anda menyerahkan selembar kertas kosong ke teller di mana penjahat bisa menulis: _"Tarik Rp 10.000; LALU HAPUS SEMUA REKENING NASABAH LAIN"_. Teller yang polos akan membaca seluruh kalimat tersebut sebagai satu perintah resmi dan mengeksekusinya.
> - **Tagged Template (`$queryRaw`)** ibarat formulir bank cetak resmi di mana instruksi _"Tarik Uang"_ sudah tercetak paten di kertas. Apapun teks yang dimasukkan penjahat di dalam kotak isian variabel `${nama}` hanya akan diperlakukan sebagai nilai string biasa (nama orang yang aneh), dan tidak akan pernah dieksekusi sebagai instruksi perintah database.

---

### Cara Kerja Tagged Template Literal

```javascript
function tagFunction(strings, ...args) {
  console.log('Template Strings:', strings);
  console.log('Values:', args);
}

const inputUser = "Joko; DROP TABLE users;";
tagFunction`SELECT * FROM users WHERE name = ${inputUser}`;

// Hasil pembedahan:
// strings: ['SELECT * FROM users WHERE name = ', '']
// args:    ['Joko; DROP TABLE users;']
```

Prisma membaca pembedahan ini dan otomatis mengubahnya menjadi _Parameterized Query_:
$$\text{SQL: } \texttt{SELECT * FROM users WHERE name = ?}$$
$$\text{Params: } \texttt{['Joko; DROP TABLE users;']}$$

---

### Perbandingan Metode Raw SQL Prisma

| Metode Prisma | Tipe Operasi SQL | Nilai Kembalian | Tingkat Keamanan |
| :--- | :--- | :--- | :--- |
| **`prismaClient.$executeRaw`** | `INSERT`, `UPDATE`, `DELETE` | Angka jumlah baris yang terpengaruh | **Sangat Aman** (Auto Parameterized) |
| **`prismaClient.$queryRaw`** | `SELECT`, `SHOW`, `DESCRIBE` | Array of Objects hasil query | **Sangat Aman** (Auto Parameterized) |
| **`prismaClient.$queryRawUnsafe`** | String SQL biasa dinamis | Array of Objects | **Berbahaya** (Rawan SQL Injection jika string digabung manual) |

---

### Pembahasan Mendalam Fitur

#### 1. Menjalankan DML dengan `$executeRaw`

```javascript
import { prismaClient } from '../src/prisma-client.js';

const id = '101';
const name = 'Joko Santoso';

// Mengembalikan jumlah baris yang berhasil di-insert
const impactedRows = await prismaClient.$executeRaw`
  INSERT INTO sampel (id, name) VALUES (${id}, ${name})
`;

console.log('Baris berhasil ditambahkan:', impactedRows); // 1
```

#### 2. Menjalankan DQL dengan `$queryRaw`

```javascript
const targetId = '101';

const results = await prismaClient.$queryRaw`
  SELECT * FROM sampel WHERE id = ${targetId}
`;

console.log('Hasil data:', results); // [ { id: '101', name: 'Joko Santoso' } ]
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas test yang menerapkan konsep ini dalam repositori:
- [`tag-function.test.js`](../test/tag-function.test.js): Pembuktian mekanika internal JavaScript Tagged Function dan simulasi parameterisasi SQL injection string.
- [`execute-sql.test.js`](../test/execute-sql.test.js): Eksekusi perintah `INSERT` via `$executeRaw` dan assertion baris terdampak.
- [`query-sql.test.js`](../test/query-sql.test.js): Eksekusi perintah `SELECT` via `$queryRaw` dengan parameterisasi aman.

Jalankan test terkait secara langsung di terminal Anda:

```bash
cd 07-database-prisma
npm test -- test/tag-function.test.js
npm test -- test/execute-sql.test.js
npm test -- test/query-sql.test.js
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Query Agregasi Analitik Lintas Tabel yang Kompleks

Ketika relasi query terlalu kompleks untuk ditulis via ORM syntax `prismaClient.user.findMany()`, manfaatkan kekuatan penuh SQL database native:

```javascript
const monthlyRevenue = await prismaClient.$queryRaw`
  SELECT 
    DATE_FORMAT(o.created_at, '%Y-%m') AS month,
    SUM(o.total_amount) AS totalRevenue,
    COUNT(o.id) AS totalOrders
  FROM orders o
  JOIN users u ON o.user_id = u.id
  WHERE u.status = 'ACTIVE' AND o.created_at >= ${startDate}
  GROUP BY month
  ORDER BY month DESC
`;
```

### ⚠️ Common Pitfalls

- **Menggunakan String Interpolation Manual di `$queryRawUnsafe`**: Menulis `$queryRawUnsafe("SELECT * FROM users WHERE name = '" + input + "'")` membuka celah fatal yang memungkinkan peretas menghapus database Anda.
- **Tipe Data BigInt Tidak Ter-serialize Otomatis ke JSON**: Query mentah yang menghasilkan kolom `COUNT(*)` atau `BigInt` membutuhkan konversi `Number(row.count)` atau BigInt serializer sebelum dikirim ke `res.json()`.

### 🌟 Best Practice

- **Gunakan Model API Default Dulu**: Selalu gunakan metode model Prisma biasa (`prismaClient.sampel.create()`, `findMany()`) untuk 90% kebutuhan umum, dan beralihlah ke Raw SQL hanya saat optimasi performa ekstrem diperlukan.

---

## 5. ✍️ Latihan Mandiri

1. Buat fungsi yang menjalankan perintah `UPDATE sampel SET name = ${newName} WHERE id = ${id}` menggunakan `$executeRaw`.
2. Validasi dengan test Jest bahwa fungsi tersebut mengembalikan nilai 1 jika ID ditemukan, dan mengembalikan nilai 0 jika ID tidak ada di tabel.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [02 - Prisma Client & Connection Pool](../02-client-and-connection/README.md)
- ➡️ **Selanjutnya:** [Projects (Real-World Implementation)](../../projects/README.md)
- 🏠 **Daftar Isi Modul 07:** [README Modul 07](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

