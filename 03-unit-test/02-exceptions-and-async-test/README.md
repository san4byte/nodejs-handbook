# 02 - Exception & Asynchronous Testing

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Menguji fungsi yang melempar kesalahan (_throw Exception_) serta menguji operasi asynchronous berbasis Promise, `async/await`, dan penanganan error terencana (`test.failing`).
> - **Kapan Digunakan**: Digunakan untuk menguji skenario error handling (validasi input salah, koneksi gagal), pemanggilan fungsi API jaringan, query database asinkron, atau pembacaan berkas Promise.
> - **Aturan Praktis**: Untuk menguji exception sinkron, fungsi yang diuji **harus dibungkus** di dalam arrow function: `expect(() => triggerError()).toThrow()`. Untuk Promise, selalu sertakan kata kunci `await`: `await expect(promise).resolves.toBe(...)`.

---

## 1. 🎯 Tujuan Belajar

- Menguji pelemparan galat menggunakan matcher `toThrow()` (berdasarkan pesan string, kelas error kustom, atau pola regex).
- Menguji fungsi asinkron dengan gaya `async/await` biasa di dalam callback test.
- Menggunakan matchers bawaan Jest `.resolves` dan `.rejects`.
- Menandai pengujian yang memang diharapkan gagal saat tahap pengerjaan fitur menggunakan `test.failing()`.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan pengujian Exception dan Async seperti **menguji sistem rem darurat dan pengiriman paket**:
>
> - **Exception Test (`toThrow`)** ibarat **menguji airbag mobil**: Anda sengaja menabrakkan mobil tiruan ke dinding penghalang untuk memastikan airbag benar-benar mengembang saat benturan keras terjadi. Jika benturan terjadi tapi airbag tidak meledak, sistem keselamatan Anda cacat.
> - **Async Test (`await expect().resolves`)** ibarat **memesan paket kurir instan**: Anda tidak bisa langsung memeriksa isi paket pada detik Anda menekan tombol order; Anda harus menunggu kurir sampai di depan pintu (`await`) sebelum membuka kardusnya.

---

### Perbandingan Sintaks Pengujian Exception & Async

| Jenis Operasi | Sintaks Standar Jest | Keterangan Penting |
| :--- | :--- | :--- |
| **Exception Sinkron** | `expect(() => fn()).toThrow('Pesan Error')` | **Wajib dibungkus arrow function** agar error ditangkap Jest |
| **Custom Error Class**| `expect(() => fn()).toThrow(MyCustomError)` | Memvalidasi tipe kelas instance error |
| **Async (Await Biasa)**| `const res = await fetchAsync(); expect(res).toBe(...)` | Callback test wajib dideklarasikan `async () => {}` |
| **Async (.resolves)** | `await expect(fetchAsync()).resolves.toBe(...)` | Ringkas dan ekspresif untuk Promise resolve |
| **Async (.rejects)** | `await expect(fetchAsync()).rejects.toThrow(...)` | Memvalidasi bahwa Promise di-reject dengan galat |
| **Uji Kegagalan Terencana** | `test.failing('fitur belum siap', () => {})` | Lolos jika test error, gagal jika test justru sukses |

---

### Pembahasan Mendalam Fitur

#### 1. Pengujian Exception dengan Pembungkus Fungsi

Jika Anda menulis `expect(callError()).toThrow()`, maka fungsi `callError()` akan meledak sebelum fungsi `expect` sempat berjalan. Oleh sebab itu, eksekusi harus ditunda dengan fungsi anonim:

```javascript
import { callException } from '../src/exception';

test('harus melempar error jika argumen kosong', () => {
  // Benar: fungsi dibungkus
  expect(() => callException()).toThrow('Input tidak boleh kosong');
});
```

#### 2. Pengujian Asynchronous Modern

```javascript
import { sayHelloAsync } from '../src/async';

test('menguji Promise resolve dan reject dengan matcher bawaan', async () => {
  // Menguji kondisi sukses (Resolve)
  await expect(sayHelloAsync('Joko')).resolves.toBe('Hello Joko');

  // Menguji kondisi gagal (Reject)
  await expect(sayHelloAsync()).rejects.toBe('name harus ada.');
});
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas test yang menerapkan konsep ini dalam repositori:
- [`exception.test.js`](../test/exception.test.js): Pengujian pelemparan exception sinkron.
- [`async.test.js`](../test/async.test.js): Pengujian fungsi asinkron menggunakan `await` langsung serta matchers `.resolves` dan `.rejects`.
- [`failing.test.js`](../test/failing.test.js): Demonstrasi penggunaan fitur `test.failing`.

Jalankan test terkait secara langsung di terminal Anda:

```bash
cd 03-unit-test
npm test -- test/exception.test.js
npm test -- test/async.test.js
npm test -- test/failing.test.js
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Menguji Endpoint Layanan Pembayaran yang Menolak Saldo Kurang

```javascript
test('harus menolak transaksi jika saldo pengguna tidak mencukupi', async () => {
  const account = { id: 10, balance: 5000 };
  const chargeAmount = 10000;

  await expect(processPayment(account, chargeAmount))
    .rejects
    .toThrow('InsufficientFundsError');
});
```

### ⚠️ Common Pitfalls

- **Lupa Kata Kunci `await` pada `.resolves` / `.rejects`**: Jika Anda menulis `expect(promise).resolves.toBe('ok')` tanpa `await`, test akan langsung selesai sebelum Promise selesai dievaluasi, memicu kondisi _false positive_ (test tampak hijau padahal aslinya gagal).
- **Lupa Membungkus Fungsi Sinkron dengan Arrow Function**: Menulis `expect(myFunc()).toThrow()` langsung akan membuat proses Jest crash dengan _unhandled error_.

### 🌟 Best Practice

- **Pastikan Menguji Dua Sisi (Happy Path & Unhappy Path)**: Jangan hanya menguji saat Promise berhasil di-resolve. Selalu buat test tandingan untuk memastikan Promise ditolak dengan benar saat input salah.

---

## 5. ✍️ Latihan Mandiri

1. Buat fungsi `divide(a, b)` yang melempar error `'Tidak bisa membagi dengan angka nol'` jika parameter `b === 0`.
2. Buat pengujian Jest untuk memvalidasi bahwa `divide(10, 0)` melempar pesan error tersebut dengan benar.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [01 - Jest Basics & Matchers](../01-jest-basics-and-matchers/README.md)
- ➡️ **Selanjutnya:** [03 - Scoping, Setup & Teardown Lifecycle](../03-setup-and-teardown/README.md)
- 🏠 **Daftar Isi Modul 03:** [README Modul 03](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

