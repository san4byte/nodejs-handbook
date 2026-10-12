# 05 - Mocking & Spying

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Mengganti fungsi atau modul dependensi nyata dengan fungsi tiruan (_Mock Function_) menggunakan `jest.fn()`, memeriksa apakah fungsi tersebut dipanggil beserta argumen yang dikirim (_Spying_), serta memalsukan nilai kembalian (_Stubbing_).
> - **Kapan Digunakan**: Digunakan saat menguji unit kode yang memiliki dependensi eksternal yang lambat atau berbahaya jika dijalankan sungguhan (seperti pengiriman email asli, pemotongan kartu kredit, SMS gateway, atau query database nyata).
> - **Aturan Praktis**: Gunakan `mockReturnValueOnce()` untuk mengatur urutan nilai return berbeda, `mockImplementation()` untuk meniru perilaku logika kompleks, dan reset mock antar-test dengan `jest.clearAllMocks()`.

---

## 1. 🎯 Tujuan Belajar

- Memahami konsep Mocking dalam pengujian unit: memutus ketergantungan antar-komponen agar pengujian murni hanya menguji unit yang bersangkutan.
- Membuat mock function dengan `jest.fn()`.
- Memeriksa histori pemanggilan mock melalui properti `mock.calls` dan matchers `toHaveBeenCalled()`, `toHaveBeenCalledTimes()`, dan `toHaveBeenCalledWith()`.
- Mengatur nilai kembalian tiruan dengan `mockReturnValue()` dan `mockReturnValueOnce()`.
- Mengganti seluruh implementasi fungsi tiruan menggunakan `mockImplementation()`.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan Mock Function seperti **manekin pengganti (stunt double) dalam adegan film aksi**:
>
> - Aktor utama (kode logika bisnis Anda) tidak boleh terluka oleh ledakan sungguhan (pengiriman email riil atau transaksi uang sungguhan).
> - Sutradara menyiapkan manekin pemeran pengganti (`jest.fn()`).
> - Setelah adegan selesai, sutradara memeriksa kamera rekaman (`expect(mock).toHaveBeenCalled()`): apakah manekin tersebut benar-benar terkena lemparan kue? Berapa kali ia melompat? Dan kalimat apa yang diucapkan saat ia mendarat?

---

### Properti & Metode Utama `jest.fn()`

| Metode / Properti | Penjelasan Fungsi | Contoh Kode |
| :--- | :--- | :--- |
| `jest.fn()` | Membuat instance fungsi tiruan baru | `const mock = jest.fn()` |
| `mock.mockReturnValue(val)` | Menyetel nilai default return fungsi | `mock.mockReturnValue(100)` |
| `mock.mockReturnValueOnce(val)` | Menyetel return value khusus untuk 1 kali panggilan berikutnya | `mock.mockReturnValueOnce('OK')` |
| `mock.mockImplementation(fn)` | Mengisi fungsi tiruan dengan implementasi kustom | `mock.mockImplementation(x => x * 2)` |
| `mock.mock.calls` | Array 2D rekaman seluruh argumen pemanggilan | `mock.mock.calls[0][0]` |
| `toHaveBeenCalledTimes(n)` | Assertion bahwa mock dipanggil tepat `n` kali | `expect(mock).toHaveBeenCalledTimes(2)` |
| `toHaveBeenCalledWith(...args)`| Assertion bahwa mock dipanggil dengan parameter tertentu | `expect(mock).toHaveBeenCalledWith('Joko')` |

---

### Pembahasan Mendalam Fitur

#### 1. Verifikasi Pemanggilan Callback

```javascript
import { calculate } from '../src/sum.js';

test('memverifikasi callback dipanggil dan menerima hasil kalkulasi', () => {
  const callback = jest.fn();

  calculate([10, 20, 30], callback); // Total: 60

  // 1. Memastikan callback dipanggil tepat 1 kali
  expect(callback).toHaveBeenCalledTimes(1);

  // 2. Memastikan argumen yang dikirim adalah angka 60
  expect(callback).toHaveBeenCalledWith(60);
});
```

#### 2. Meniru Nilai Return dan Implementasi Dinamis

```javascript
test('mengatur mock return value bertahap', () => {
  const fetchPrice = jest.fn();
  fetchPrice.mockReturnValueOnce(5000)   // Panggilan ke-1
            .mockReturnValueOnce(12000); // Panggilan ke-2

  expect(fetchPrice()).toBe(5000);
  expect(fetchPrice()).toBe(12000);
});
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas test yang menerapkan konsep ini dalam repositori:
- [`mock-function.test.js`](../test/mock-function.test.js): Demonstrasi verifikasi `mock.calls`, inspeksi panjang pemanggilan, penyetelan `mockReturnValueOnce`, dan modifikasi fungsi via `mockImplementation`.

Jalankan test terkait secara langsung di terminal Anda:

```bash
cd 03-unit-test
npm test -- test/mock-function.test.js
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Mem-mocking Notifikasi Email saat Registrasi Pengguna

Kita ingin menguji apakah proses registrasi berhasil tanpa benar-benar mengirimkan email fisik ke inbox pelanggan:

```javascript
test('registrasi user harus memanggil service kirim email dengan benar', async () => {
  const mockEmailService = {
    sendWelcomeEmail: jest.fn().mockResolvedValue(true)
  };

  const userService = new UserService(mockEmailService);
  await userService.register({ email: 'joko@example.com', name: 'Joko' });

  // Memastikan email service terpanggil dengan alamat yang benar
  expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledTimes(1);
  expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith('joko@example.com');
});
```

### ⚠️ Common Pitfalls

- **State Mock Tidak Direset Antar-Test**: Jika sebuah mock function dipakai bersama di beberapa test tanpa `beforeEach(() => jest.clearAllMocks())`, riwayat pemanggilan dari test sebelumnya akan menumpuk dan merusak ekspektasi `toHaveBeenCalledTimes`.
- **Over-Mocking (Semua Hal Di-mock)**: Mem-mocking terlalu banyak hal sampai logika yang diuji sebenarnya tidak pernah benar-benar berjalan. Mock hanya ketergantungan eksternal (I/O, network, third party).

### 🌟 Best Practice

- **Gunakan `mockResolvedValue()` untuk Promise**: Untuk fungsi asinkron, gunakan `mock.mockResolvedValue(data)` daripada menulis manual `mock.mockReturnValue(Promise.resolve(data))`.

---

## 5. ✍️ Latihan Mandiri

1. Buat fungsi `checkout(cart, paymentGateway)` yang memanggil `paymentGateway.charge(total)`.
2. Buat unit test dengan `jest.fn()` untuk memverifikasi bahwa `charge()` dipanggil dengan jumlah uang yang tepat sesuai total isi keranjang belanja.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [04 - Test Filtering & Parameterized Testing](../04-filtering-and-parameterized/README.md)
- ➡️ **Selanjutnya:** [04 - Production Logging with Winston](../../04-logging/README.md)
- 🏠 **Daftar Isi Modul 03:** [README Modul 03](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

