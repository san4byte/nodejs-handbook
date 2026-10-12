# 03 - Nested Objects & Array Validation

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Memvalidasi struktur data JSON yang kompleks dan berlapis (_Nested Objects_) serta kumpulan daftar data berulang (_Array of Objects_) menggunakan `Joi.object()` dan `Joi.array().items()`.
> - **Kapan Digunakan**: Digunakan saat menerima payload registrasi yang menyertakan alamat bertingkat (`user.address.street`), keranjang belanja e-commerce yang memuat daftar produk (`items: [...]`), atau bulk-insert data.
> - **Aturan Praktis**: Gunakan `.unique()` pada array untuk mencegah duplikasi data, dan `.min(1)` untuk memastikan array tidak kosong. Atur `{ abortEarly: false }` agar seluruh properti yang bermasalah di dalam objek berlapis dilaporkan sekaligus.

---

## 1. 🎯 Tujuan Belajar

- Menguasai pemodelan skema objek kompleks: `Joi.object({ key: Joi.type() })`.
- Memvalidasi objek bersarang (_Nested Objects_) secara rekursif (misal data profil yang memiliki child `address` dan `geo`).
- Menguasai validasi array: `Joi.array().items(...)`, batasan ukuran `.min()` dan `.max()`.
- Menerapkan aturan integritas koleksi array: mencegah nilai duplikat via `.unique()`.
- Melacak lokasi kesalahan hierarkis melalui `detail.path` (contoh: `['address', 'city']` atau `['items', 0, 'price']`).

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan validasi objek dan array seperti **pemeriksaan bea cukai kargo impor**:
>
> - **`Joi.object()`** adalah **kardus induk pengiriman**: memiliki label penerima dan alamat gudang.
> - **Nested Object (`address`)** adalah **kotak kecil di dalam kardus induk**: harus memiliki segel tersendiri.
> - **`Joi.array().items()`** adalah **daftar manifes barang**: kardus wajib memuat minimal 1 jenis barang (`min(1)`), dan setiap barang di dalam daftar harus memiliki izin resmi yang identik.
> - **`.unique()`** adalah **pemeriksaan nomor registrasi unik**: tidak boleh ada dua barang di dalam satu kardus yang menggunakan nomor seri yang sama.

---

### Metode Kunci Validasi Objek & Array

| Metode | Parameter / Opsi | Fungsi |
| :--- | :--- | :--- |
| `Joi.object(schema)` | Skema kunci properti | Mendefinisikan struktur objek JSON |
| `Joi.array().items(schema)`| Skema elemen array | Menentukan tipe data setiap elemen di dalam array |
| `array.min(n)` / `max(n)` | Panjang minimal/maksimal | Membatasi jumlah item di dalam array |
| `array.unique([comparator])`| Field pembanding opsional | Memastikan seluruh elemen di dalam array bersifat unik (tidak boleh duplikat) |
| `{ abortEarly: false }` | Opsi validasi | Menginstruksikan Joi agar tidak berhenti di error pertama, tapi mengumpulkan semua error |

---

### Pembahasan Mendalam Fitur

#### 1. Validasi Objek Bersarang (Nested Object)

```javascript
import Joi from 'joi';

const userProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).required(),
  contact: Joi.object({
    phone: Joi.string().pattern(/^[0-9]+$/).required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      postalCode: Joi.string().length(5).required()
    }).required()
  }).required()
});
```

#### 2. Validasi Array of Objects dengan Uniqueness

```javascript
const orderItemSchema = Joi.object({
  productId: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().positive().required()
});

const orderSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  // Array wajib punya minimal 1 item, dan tiap productId tidak boleh kembar
  items: Joi.array()
    .items(orderItemSchema)
    .min(1)
    .unique('productId') // Cegah duplikasi ID produk di keranjang belanja
    .required()
});
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas test yang menerapkan konsep ini dalam repositori:
- [`object.test.js`](../test/object.test.js): Validasi objek user dasar dan pengujian nested object `address`.
- [`array.test.js`](../test/array.test.js): Validasi array string sederhana dengan `.unique()` dan array of objects dengan validasi email.

Jalankan test terkait secara langsung di terminal Anda:

```bash
cd 06-validation
npm test -- test/object.test.js
npm test -- test/array.test.js
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Memformat Pesan Error Menjadi Objek Kamus yang Ramah Form UI

Frontend sering membutuhkan pesan error dalam format mapping `{ "address.city": "Kota wajib diisi" }`:

```javascript
function formatValidationErrors(details) {
  const errors = {};
  details.forEach((item) => {
    const key = item.path.join('.');
    errors[key] = item.message;
  });
  return errors;
}
```

### ⚠️ Common Pitfalls

- **Membiarkan Objek Child Tanpa `.required()`**: Jika Anda menulis `address: Joi.object({ ... })` tanpa `.required()`, maka jika pengguna tidak mengirimkan properti `address` sama sekali, Joi akan menganggapnya valid karena child objek dianggap opsional.
- **Kinerja `unique()` pada Array Sangat Besar**: Memeriksa `.unique()` pada array berukuran puluhan ribu item memakan komputasi $O(n^2)$ jika tidak diindeks dengan baik.

### 🌟 Best Practice

- **Gunakan Komposisi Skema Modular**: Pecah skema besar menjadi variabel terpisah (`addressSchema`, `itemSchema`) lalu satukan ke dalam skema utama untuk memudahkan keterbacaan kode dan reusability.

---

## 5. ✍️ Latihan Mandiri

1. Buat skema untuk data resep makanan yang memiliki properti `nama` (string) dan `bahanBaku` (array of strings yang wajib unik dan minimal berisi 3 bahan).
2. Ujilah skema dengan input yang memuat bahan kembar seperti `['Garam', 'Gula', 'Garam']` dan amati respon penolakannya.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [02 - Primitive Types & Date Validation](../02-primitive-and-date/README.md)
- ➡️ **Selanjutnya:** [04 - Custom Validation Rules & Messages](../04-custom-validators-and-messages/README.md)
- 🏠 **Daftar Isi Modul 06:** [README Modul 06](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

