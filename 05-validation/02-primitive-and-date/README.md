# 02 - Primitive Types & Date Validation

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Memvalidasi berbagai tipe data primitif secara spesifik: string berformat (email, URI, alphanumeric, pola regex), angka numerik (integer, float, kelipatan, batas minimum/maksimum), serta tanggal dan waktu (`Joi.date()`) dengan dukungan kata kunci dinamis seperti `'now'`.
> - **Kapan Digunakan**: Digunakan saat memvalidasi formulir tanggal lahir pengguna, harga produk, kuantitas stok barang, format URL website, dan alamat email.
> - **Aturan Praktis**: Pada validasi tanggal lahir, gunakan `Joi.date().max('now')` untuk memastikan tanggal lahir tidak berada di masa depan, dan gunakan `.min('1-1-1900')` untuk batas minimal realistis manusia.

---

## 1. 🎯 Tujuan Belajar

- Menguasai validator string tingkat lanjut: `.email()`, `.uri()`, `.alphanum()`, `.trim()`, `.lowercase()`.
- Menguasai validator numerik: `.integer()`, `.positive()`, `.min()`, `.max()`, `.greater()`.
- Menguasai validator tanggal: `Joi.date()`, format timestamp ISO 8601, pembanding dinamis `.max('now')`, dan rentang tanggal valid.
- Memahami hasil parsing tanggal yang otomatis dikonversi menjadi instance JavaScript `Date`.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan validasi tipe data primitif seperti **mesin pemilah koin dan verifikasi tiket otomatis**:
>
> - **`Joi.number().integer().positive()`** adalah **lubang koin**: uang kertas tidak bisa masuk, koin bernilai negatif tidak ada, dan koin bengkok (desimal tak valid) akan ditolak keluar.
> - **`Joi.date().max('now')`** adalah **pemeriksaan stempel kadaluarsa makanan**: makanan yang diproduksi besok pagi adalah barang mustahil/palsu, sehingga stempel tanggal produksi tidak boleh melebihi hari ini (`'now'`).

---

### Validator Primitif Kunci Joi

| Tipe Data | Metode Rantai Populer | Contoh Aturan Skema |
| :--- | :--- | :--- |
| **String** | `.email()`, `.alphanum()`, `.uuid()` | `Joi.string().email().lowercase()` |
| **Number** | `.integer()`, `.min()`, `.max()`, `.precision()` | `Joi.number().min(0).max(100)` |
| **Boolean**| `.truthy()`, `.falsy()` | `Joi.boolean().sensitive()` |
| **Date** | `.min()`, `.max()`, `.timestamp()`, `.iso()` | `Joi.date().max('now').min('1-1-2000')` |

---

### Pembahasan Mendalam Fitur

#### 1. Validasi Tanggal Dinamis

```javascript
import Joi from 'joi';

const bookingSchema = Joi.object({
  checkInDate: Joi.date().min('now').required(), // Tidak boleh di masa lalu
  checkOutDate: Joi.date().greater(Joi.ref('checkInDate')).required(), // Harus setelah check-in
  guests: Joi.number().integer().min(1).max(10).required()
});
```

#### 2. Sanitasi String Otomatis

Joi tidak hanya memvalidasi, tapi juga dapat memodifikasi string menjadi format bersih:

```javascript
const emailSchema = Joi.string().trim().lowercase().email().required();

const res = emailSchema.validate('   Joko.Santoso@GMAIL.COM   ');
console.log(res.value); // 'joko.santoso@gmail.com' (spasi dibuang & huruf kecil semua)
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas test yang menerapkan konsep ini dalam repositori:
- [`date.test.js`](../test/date.test.js): Pengujian validasi tanggal lahir dengan batas `max('now')` dan batas minimal `min('1-1-2000')`.

Jalankan test terkait secara langsung di terminal Anda:

```bash
cd 06-validation
npm test -- test/date.test.js
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Menghitung Batas Usia Minimal (17 Tahun)

```javascript
import Joi from 'joi';

// Batas maksimal tanggal lahir: 17 tahun sebelum hari ini
const seventeenYearsAgo = new Date();
seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);

const ktpSchema = Joi.object({
  nik: Joi.string().length(16).pattern(/^[0-9]+$/).required(),
  tanggalLahir: Joi.date().max(seventeenYearsAgo).required()
    .messages({ 'date.max': 'Pendaftar wajib berusia minimal 17 tahun.' })
});
```

### ⚠️ Common Pitfalls

- **Format String Tanggal yang Ambigius**: Menulis format string seperti `'1-2-2024'` bisa ditafsirkan sebagai 1 Februari atau 2 Januari tergantung lokal server. Biasakan menggunakan format ISO `YYYY-MM-DD` (contoh: `'2024-02-01'`).

### 🌟 Best Practice

- **Gunakan `.trim()` untuk String Input Pengguna**: Menambahkan `.trim()` mencegah pendaftaran nama pengguna yang mengandung spasi tidak sengaja di awal atau akhir kata.

---

## 5. ✍️ Latihan Mandiri

1. Buat skema untuk harga barang `price` yang wajib merupakan bilangan kelipatan 500 (gunakan `.multiple(500)`).
2. Ujilah skema dengan angka 1000 (valid) dan 1250 (gagal).

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [01 - Joi Basics & Schema Definition](../01-joi-basics-and-schema/README.md)
- ➡️ **Selanjutnya:** [03 - Nested Objects & Array Validation](../03-nested-objects-and-arrays/README.md)
- 🏠 **Daftar Isi Modul 06:** [README Modul 06](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

