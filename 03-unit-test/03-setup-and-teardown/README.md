# 03 - Scoping, Setup & Teardown Lifecycle

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Menyiapkan kondisi awal lingkungan pengujian sebelum pengujian berjalan (_Setup_) dan membersihkan kembali data atau koneksi setelah pengujian selesai (_Teardown_).
> - **Kapan Digunakan**: Digunakan saat membuat data dummy di database sebelum test, menginisialisasi server test, atau mereset state memori dan cache agar setiap test terisolasi secara murni tanpa efek samping antar-test (_no side effects_).
> - **Aturan Praktis**: Gunakan `beforeEach` dan `afterEach` untuk operasi yang harus diulang pada setiap blok `test`. Gunakan `beforeAll` dan `afterAll` hanya untuk operasi berat satu kali per file pengujian (seperti koneksi database).

---

## 1. 🎯 Tujuan Belajar

- Memahami 4 fungsi siklus hidup (lifecycle hooks) utama Jest: `beforeEach`, `afterEach`, `beforeAll`, dan `afterAll`.
- Memahami struktur pengelompokan pengujian menggunakan blok `describe('kategori', () => {})`.
- Menguasai urutan eksekusi scoping (hierarki hook dari root hingga ke sub-blok `describe` bersarang).
- Menjaga independensi setiap unit test agar hasil test tidak saling bergantung satu sama lain.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan Lifecycle Hooks Jest seperti **jadwal panggung teater sandiwara**:
>
> - **`beforeAll`**: Menyalakan lampu gedung utama dan membuka gerbang gedung teater sebelum seluruh pertunjukan dimulai.
> - **`beforeEach`**: Merapikan properti panggung dan menyapu lantai panggung sebelum setiap babak drama baru dimulai.
> - **`test`**: Para aktor beraksi memainkan adegan babak tersebut.
> - **`afterEach`**: Menutup tirai sejenak dan menurunkan dekorasi bekas babak yang baru selesai.
> - **`afterAll`**: Mematikan seluruh listrik gedung dan mengunci pintu teater setelah semua babak pertunjukan selesai di malam hari.

---

### Urutan Eksekusi Hook Jest

```text
beforeAll (Dijalankan 1x di awal)
  ├── beforeEach (Sebelum Test 1)
  │     └── test('Test 1')
  ├── afterEach  (Setelah Test 1)
  │
  ├── beforeEach (Sebelum Test 2)
  │     └── test('Test 2')
  └── afterEach  (Setelah Test 2)
afterAll (Dijalankan 1x di akhir)
```

---

### Pembahasan Mendalam Fitur

#### 1. Lifecycle Hooks Dasar

```javascript
beforeAll(() => {
  console.log('Membuka koneksi database test...');
});

afterAll(() => {
  console.log('Menutup koneksi database test...');
});

beforeEach(() => {
  console.log('Mengosongkan tabel transaksi (Reset State)...');
});

afterEach(() => {
  console.log('Membersihkan mock memory...');
});

test('Uji simpan data', () => {
  expect(1 + 1).toBe(2);
});
```

#### 2. Isolasi Cakupan (Scoping) dengan Blok `describe`

Hook yang diletakkan di dalam blok `describe` tertentu **hanya akan berlaku** untuk test yang berada di dalam blok tersebut:

```javascript
describe('Fitur Autentikasi', () => {
  beforeEach(() => {
    // Hanya berlaku untuk test di dalam blok 'Fitur Autentikasi'
    seedUserTable();
  });

  test('login sukses', () => { ... });
  test('login gagal', () => { ... });
});
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas test yang menerapkan konsep ini dalam repositori:
- [`setup.test.js`](../test/setup.test.js): Urutan eksekusi lengkap `beforeAll`, `afterAll`, `beforeEach`, dan `afterEach`.
- [`scope.test.js`](../test/scope.test.js): Pembuktian isolasi hierarki cakupan blok `describe` bersarang.

Jalankan test terkait secara langsung di terminal Anda:

```bash
cd 03-unit-test
npm test -- test/setup.test.js
npm test -- test/scope.test.js
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Menghindari Test Flakiness Akibat Polusi State

Jika Test A memasukkan pengguna dengan email `test@mail.com` ke memory database, dan Test B mencoba mendaftarkan pengguna dengan email yang sama, Test B bisa gagal karena duplikasi email. Dengan `beforeEach(() => clearDatabase())`, setiap test selalu dimulai dari keadaan bersih.

### ⚠️ Common Pitfalls

- **Menyimpan State Antar-Test**: Membuat test kedua bergantung pada data yang dibuat oleh test pertama. Jika test pertama di-skip atau urutannya diacak, test kedua akan gagal misterius.
- **Lupa Await di Asynchronous Hook**: Jika `beforeEach` melakukan query database asinkron, fungsi tersebut wajib dideklarasikan `beforeEach(async () => { await db.connect(); })`.

### 🌟 Best Practice

- **Gunakan Prinsip FIRST (Fast, Isolated, Repeatable, Self-validating, Timely)**: Pastikan setiap test dapat dijalankan sendiri secara mandiri tanpa harus menjalankan test lainnya.

---

## 5. ✍️ Latihan Mandiri

1. Buat blok `describe('Kalkulator State')` dengan variabel in-memory `let counter = 0;`.
2. Pasang hook `beforeEach` yang mereset `counter = 0` sebelum tiap test, lalu buktikan bahwa penambahan counter di test pertama tidak mempengaruhi nilai awal di test kedua.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [02 - Exception & Asynchronous Testing](../02-exceptions-and-async-test/README.md)
- ➡️ **Selanjutnya:** [04 - Test Filtering & Parameterized Testing](../04-filtering-and-parameterized/README.md)
- 🏠 **Daftar Isi Modul 03:** [README Modul 03](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

