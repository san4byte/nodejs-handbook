# 📘 Modul 05: Schema Data Validation with Joi

Selamat datang di **Modul 05**! Modul ini membahas secara mendalam teknik validasi dan sanitasi data payload input aplikasi menggunakan pustaka validasi skema paling populer dan ekspresif di ekosistem Node.js: **Joi**.

---

## 📚 Daftar Materi Pembelajaran

1. [01 - Joi Basics & Schema Definition](01-joi-basics-and-schema/README.md)
   - Konsep deklarasi skema, eksekusi validasi via `schema.validate()`, penanganan `result.error`, dan type coercion otomatis.
2. [02 - Primitive Types & Date Validation](02-primitive-and-date/README.md)
   - Validasi tipe data primitif: string format (`email`, `alphanum`, `min`, `max`), angka batasan, boolean, serta validasi parsing tanggal (`Joi.date()`).
3. [03 - Nested Objects & Array Validation](03-nested-objects-and-arrays/README.md)
   - Validasi struktur JSON kompleks berlapis via `Joi.object().keys()`, validasi koleksi data array via `Joi.array().items()`, dan duplikasi nilai unik.
4. [04 - Custom Validation Rules & Messages](04-custom-validators-and-messages/README.md)
   - Membuat fungsi aturan validator khusus (`custom()`) untuk aturan bisnis unik serta lokalisasi pesan kesalahan kustom yang ramah pengguna via `.messages()`.

---

## 🛠️ Cara Menjalankan

Masuk ke direktori modul ini, pasang dependensi, lalu jalankan test suite validasi:

```bash
cd 05-validation
npm install

# Menjalankan seluruh pengujian skema validasi
npm test

# Menjalankan spesifik test file:
npm test -- test/validation.test.js
npm test -- test/object.test.js
npm test -- test/array.test.js
npm test -- test/costom.test.js
```

---

## 🧭 Navigasi

- ⬅️ **Modul Sebelumnya:** [04 - Production Logging with Winston](../04-logging/README.md)
- ➡️ **Modul Selanjutnya:** [06 - Modern Database Persistence with Prisma ORM](../06-database-prisma/README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../README.md)
