# 01 - Joi Basics & Schema Definition

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Mendefinisikan kontrak cetak biru skema data (_Schema_) dan memvalidasi objek JavaScript terhadap aturan tersebut menggunakan `schema.validate(data)`.
> - **Kapan Digunakan**: Digunakan sebagai filter gerbang pertama pada setiap request masuk di API endpoint (`req.body`, `req.query`, `req.params`) sebelum data diteruskan ke controller atau database.
> - **Aturan Praktis**: Joi mengembalikan objek berstruktur `{ value, error }`. Joi secara otomatis melakukan _Type Coercion_ (misal string `"true"` menjadi boolean `true`, string `"100"` menjadi number `100`). Gunakan opsi `{ abortEarly: false }` jika ingin menampilkan seluruh daftar error sekaligus.

---

## 1. 🎯 Tujuan Belajar

- Memahami filosofi skema deklaratif Joi.
- Menggunakan metode validasi inti: `schema.validate(input, [options])`.
- Menangani struktur objek `error`: `error.message`, `error.details`, dan path field yang bermasalah.
- Memahami konsep **Type Coercion** dan cara memanfaatkannya pada parsing query string HTTP.
- Membedakan validasi wajib (`.required()`) vs opsional (`.optional()`).

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan validasi Joi seperti **pemeriksaan paspor di loket imigrasi bandara**:
>
> - **Skema Joi (`Joi.string().min(3).required()`)** adalah **buku syarat imigrasi**: paspor wajib ada (`required`), harus berupa buku fisik (`string`), dan tidak boleh kurang dari 3 halaman (`min(3)`).
> - **Input Klien** adalah **paspor yang disodorkan turis**.
> - **Petugas Loket (`schema.validate()`)** mencocokkan paspor dengan buku syarat. Jika paspor robek atau masa berlakunya habis, petugas langsung menolak turis dan memberikan stempel penolakan disertai catatan pelanggaran tertulis (`error.message`).

---

### Struktur Kembalian `schema.validate()`

```javascript
const result = schema.validate(input);
```

- **`result.value`**: Data input yang sudah divalidasi dan disanitasi (tipe data sudah di-convert sesuai skema).
- **`result.error`**: `ValidationError` jika data melanggar aturan. Bernilai `undefined` jika data valid.
- **`result.error.details`**: Array rincian setiap pelanggaran, mencakup `message`, `path`, dan `type`.

---

### Pembahasan Mendalam Fitur

#### 1. Deklarasi Skema Dasar & Evaluasi Error

```javascript
import Joi from 'joi';

const usernameSchema = Joi.string().alphanum().min(3).max(15).required();

const validation = usernameSchema.validate('ab');

if (validation.error) {
  console.error('Data tidak valid:', validation.error.message);
  // Output: '"value" length must be at least 3 characters long'
} else {
  console.log('Username valid:', validation.value);
}
```

#### 2. Penanganan Type Coercion Otomatis

Secara default, Joi mengonversi representasi string menjadi tipe primitif target yang semantik:

```javascript
const ageSchema = Joi.number().min(18).required();

// String '21' otomatis diubah menjadi angka integer 21:
const res = ageSchema.validate('21');
console.log(typeof res.value); // 'number'
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas test yang menerapkan konsep ini dalam repositori:
- [`validation.test.js`](../test/validation.test.js): Deklarasi skema string, number, boolean, dan pembuktian konversi tipe data otomatis.
- [`validation-error.test.js`](../test/validation-error.test.js): Pemeriksaan detail pesan galat pada input yang melanggar batasan.

Jalankan test terkait secara langsung di terminal Anda:

```bash
cd 06-validation
npm test -- test/validation.test.js
npm test -- test/validation-error.test.js
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Express Validation Middleware Generator

Membuat middleware Express yang dapat digunakan berulang-ulang untuk memvalidasi `req.body`:

```javascript
export const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorDetails = error.details.map(d => d.message);
    return res.status(400).json({ errors: errorDetails });
  }
  req.body = value; // Gunakan data yang sudah disanitasi
  next();
};
```

### ⚠️ Common Pitfalls

- **Menggunakan Data Asli Tanpa Sanitasi**: Selalu gunakan `result.value`, bukan `req.body` mentah, karena `result.value` sudah dibersihkan dari spasi liar atau tipe data string yang sudah dikonversi ke number.
- **Lupa Menambahkan `.required()`**: Field di Joi bersifat opsional secara default. Jika Anda menulis `Joi.string().min(5)` tanpa `.required()`, nilai `undefined` akan dianggap lolos validasi.

### 🌟 Best Practice

- **Gunakan Opsi `{ stripUnknown: true }`**: Opsi ini secara otomatis membuang properti asing yang tidak terdaftar di skema untuk mencegah serangan _Mass Assignment Vulnerability_.

---

## 5. ✍️ Latihan Mandiri

1. Buat skrip yang mendefinisikan skema registrasi email dan password (minimal 8 karakter, wajib ada huruf dan angka).
2. Ujilah skema tersebut dengan password `'12345'` dan amati rincian pesan error yang dihasilkan.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [04 - Exception & Rejection Handlers](../../04-logging/04-exception-and-rejections/README.md)
- ➡️ **Selanjutnya:** [02 - Primitive Types & Date Validation](../02-primitive-and-date/README.md)
- 🏠 **Daftar Isi Modul 05:** [README Modul 05](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

