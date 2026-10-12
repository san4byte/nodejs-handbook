# 04 - Custom Validation Rules & Messages

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Membuat fungsi aturan validasi kustom tingkat lanjut menggunakan `.custom((value, helper) => {})` untuk kebutuhan logika bisnis yang tidak didukung secara native oleh Joi, serta melokalisasi pesan kesalahan ke bahasa Indonesia atau bahasa ramah pengguna menggunakan `.messages()`.
> - **Kapan Digunakan**: Digunakan saat memvalidasi kecocokan konfirmasi password (`password === confirmPassword`), mengecek nomor induk kependudukan/kredit berbobot rumus matematika (Luhn algorithm), atau menerjemahkan pesan default bahasa Inggris Joi ke bahasa Indonesia.
> - **Aturan Praktis**: Di dalam fungsi `.custom()`, jika validasi lolos kembalikan `value`. Jika gagal, kembalikan `helper.error('kode.error')` dan petakan pesan teksnya via `.messages()`.

---

## 1. 🎯 Tujuan Belajar

- Menulis fungsi validasi kustom: parameter `(value, helper)`.
- Mengembalikan nilai yang disanitasi atau melempar kode error via `helper.error()`.
- Menerapkan validasi lintas properti (_Cross-field Validation_) seperti kecocokan `password` dan `confirmPassword`.
- Mengganti template pesan error bawaan Joi (`string.min`, `any.required`, `string.email`) menggunakan objek `.messages()`.
- Menggunakan placeholder template Joi: `{{#label}}`, `{{#limit}}`, dan `{{#value}}`.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan Custom Validator & Messages seperti **pemberitahuan kesalahan pada formulir pendaftaran SIM**:
>
> - **Pesan Standar Joi (Bahasa Inggris Teknis)** ibarat peringatan teknis komputer: _`"value" length must be at least 6 characters long`_. Pengguna awam akan bingung membaca kata `"value"`.
> - **Kustomisasi Pesan (`.messages()`)** adalah **papan petunjuk berbahasa Indonesia yang sopan**: _`"Kata sandi wajib diisi minimal 6 karakter"`_.
> - **Custom Validator (`.custom()`)** adalah **petugas verifikator yang menguji tanda tangan**: mencocokkan apakah tanda tangan di lembar pertama sama persis dengan tanda tangan di lembar kedua.

---

### Kode Error Populer Joi untuk Kustomisasi Pesan

| Kode Galat Joi | Kapan Muncul? | Template Pesan yang Dianjurkan |
| :--- | :--- | :--- |
| `any.required` | Properti bernilai `undefined` padahal wajib | `'{{#label}} wajib diisi'` |
| `string.empty` | String dikirim sebagai string kosong `""` | `'{{#label}} tidak boleh kosong'` |
| `string.min` | Panjang karakter kurang dari batas `.min(n)` | `'{{#label}} minimal harus {{#limit}} karakter'` |
| `string.email` | Format string bukan alamat email valid | `'Format {{#label}} tidak valid'` |
| `custom.error` | Dipicu secara manual dari `.custom()` | Pesan spesifik aturan logika bisnis Anda |

---

### Pembahasan Mendalam Fitur

#### 1. Validasi Password & Confirm Password (Cross-Field)

```javascript
import Joi from 'joi';

const registrationSchema = Joi.object({
  password: Joi.string().min(6).required()
    .custom((val, helper) => {
      if (val.toLowerCase().includes('password')) {
        return helper.error('password.common');
      }
      return val;
    })
    .messages({
      'password.common': 'Kata sandi terlalu mudah ditebak (tidak boleh memuat kata "password")'
    }),
  confirmPassword: Joi.string().required()
})
  // Validasi tingkat objek untuk mencocokkan kedua field:
  .custom((obj, helper) => {
    if (obj.password !== obj.confirmPassword) {
      return helper.error('password.mismatch');
    }
    return obj;
  })
  .messages({
    'password.mismatch': 'Konfirmasi kata sandi tidak cocok dengan kata sandi'
  });
```

#### 2. Kustomisasi Pesan Error Global dengan Placeholder

```javascript
const schema = Joi.string().min(3).max(10).required().messages({
  'any.required': 'Kolom {{#label}} wajib diisi!',
  'string.min': 'Kolom {{#label}} harus memiliki minimal {{#limit}} karakter!',
  'string.max': 'Kolom {{#label}} tidak boleh melebihi {{#limit}} karakter!'
});
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas test yang menerapkan konsep ini dalam repositori:
- [`costom.test.js`](../test/costom.test.js): Pengujian validator kustom untuk pencegahan awalan kata tertentu dan verifikasi kesamaan dua field password.
- [`messages.test.js`](../test/messages.test.js): Lokalisasi pesan kesalahan Joi ke bahasa Indonesia menggunakan placeholder `{{#label}}` dan `{{#limit}}`.

Jalankan test terkait secara langsung di terminal Anda:

```bash
cd 06-validation
npm test -- test/costom.test.js
npm test -- test/messages.test.js
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Menghindari Validasi Asinkron Berbahaya di dalam Joi

Joi mendukung `.external()` untuk validasi asinkron (seperti mengecek apakah email sudah terdaftar di database), namun praktik arsitektur terbaik adalah **memisahkan validasi bentuk data (Schema Shape via Joi)** dari **validasi integritas basis data (Business Logic di Service Layer)**:
1. Joi memvalidasi bahwa email berformat string email yang benar.
2. Service Layer memanggil `db.user.findUnique({ where: { email } })` untuk mengecek keunikan data di database.

### ⚠️ Common Pitfalls

- **Lupa Mengembalikan Nilai `return value` di `.custom()`**: Jika validasi berhasil dan Anda lupa mengembalikan `return value`, maka nilai field tersebut akan berubah menjadi `undefined`.
- **Typo pada Kode Error di `.messages()`**: Menulis `'string.minimum'` alih-alih `'string.min'` akan membuat pesan custom diabaikan dan Joi kembali menggunakan pesan default bahasa Inggris.

### 🌟 Best Practice

- **Gunakan `.label('Nama Tampilan')`**: Secara default `{{#label}}` menggunakan nama properti teknis (misal `phoneNumber`). Anda dapat memperindahnya dengan `.label('Nomor Telepon')` agar pesan error tampil sebagai _"Nomor Telepon wajib diisi"_.

---

## 5. ✍️ Latihan Mandiri

1. Buat validator custom `.custom()` yang memvalidasi bahwa sebuah string nomor pelat kendaraan wajib diawali dengan huruf kapital (misal `'B 1234 ABC'`).
2. Pasang pesan kustom dalam bahasa Indonesia jika format pelat tidak sesuai.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [03 - Nested Objects & Array Validation](../03-nested-objects-and-arrays/README.md)
- ➡️ **Modul Selanjutnya:** [06 - Modern Database Persistence with Prisma ORM](../../06-database-prisma/README.md)
- 🏠 **Daftar Isi Modul 05:** [README Modul 05](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

