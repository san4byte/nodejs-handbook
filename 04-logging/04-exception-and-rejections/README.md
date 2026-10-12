# 04 - Exception & Rejection Handlers

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Menangkap dan mencatat galat fatal yang tidak sengaja lolos dari blok `try...catch` (`uncaughtException`) serta penolakan Promise yang terabaikan (`unhandledRejection`) secara otomatis ke berkas log audit khusus.
> - **Kapan Digunakan**: Wajib dipasang pada inisialisasi aplikasi backend untuk memastikan tidak ada kejadian server crash yang terjadi secara "misterius" tanpa jejak rekaman di log.
> - **Aturan Praktis**: Gunakan properti `handleExceptions: true` dan `handleRejections: true` pada instance transport berkas `winston.transports.File`.

---

## 1. 🎯 Tujuan Belajar

- Memahami dua kategori error tak tertangani di Node.js: `uncaughtException` (galat sinkron) dan `unhandledRejection` (galat asynchronous Promise).
- Mengonfigurasi logger Winston agar bertindak sebagai penangkap galat global otomatis.
- Menyimpan dump stack trace error fatal ke berkas khusus (`exception.log`).
- Memahami protokol pemulihan proses setelah `uncaughtException` terjadi.

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan Exception Handlers seperti **jaring pengaman pemain sirkus akrobatik**:
>
> - Para pemain sirkus (kode bisnis aplikasi Anda) berusaha sebaik mungkin untuk tidak jatuh dengan memakai tali pelindung (`try...catch`).
> - Namun, jika terjadi kecelakaan tak terduga di mana tali terlepas di udara (`uncaughtException`), pemain akan jatuh ke jaring pengaman paling dasar (`handleExceptions: true`).
> - Jaring ini segera mencatat waktu kejadian, rekaman posisi jatuh, dan memicu protokol penyelamatan medis sebelum panggung sirkus ditutup sementara.

---

### Perbandingan Kategori Unhandled Errors

| Jenis Galat | Pemicu Contoh | Efek Default Node.js | Penanganan Winston |
| :--- | :--- | :--- | :--- |
| **`uncaughtException`** | Memanggil fungsi yang tidak ada: `nonExistentFunction()` | **Proses mati seketika** (Exit code 1) | `handleExceptions: true` mencatat stack trace lengkap ke file sebelum keluar |
| **`unhandledRejection`** | Promise di-reject tanpa ada blok `.catch()` atau `await try...catch` | Di Node.js modern, mematikan proses dengan fatal error | `handleRejections: true` mencatat alasan rejection dan data payload terkait |

---

### Pembahasan Mendalam Fitur

#### 1. Menangani Exception Sinkron Otomatis

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      handleExceptions: true // Menangkap seluruh uncaughtException
    })
  ]
});

// Kesalahan fatal yang tidak ditangkap try...catch:
callUndefinedFunction();
// Winston otomatis mencegat dan menuliskan seluruh call stack ke logs/exceptions.log!
```

#### 2. Menangani Penolakan Promise Tak Tertangani

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'logs/rejections.log',
      handleRejections: true // Menangkap unhandledRejection
    })
  ]
});

async function task() {
  return Promise.reject(new Error('Koneksi pembayaran pihak ketiga timeout!'));
}

task(); // Dipanggil tanpa await dan tanpa .catch()
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas praktik pada subtopik ini:
- [`logging-exception.js`](../src/logging-exception.js): Pemicuan pemanggilan fungsi tidak terdefinisi dan penangkapan otomatis ke `exception.log`.
- [`logging-rejections.js`](../src/logging-rejections.js): Penolakan Promise asinkron tak tertangani dan penulisan otomatis ke berkas log audit.
- [`exception.log`](../exception.log): Berkas log hasil rekaman penanganan error fatal.

Jalankan demonstrasi secara langsung di terminal Anda:

```bash
cd 04-logging
node src/logging-exception.js
node src/logging-rejections.js
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Menghindari Zombifikasi Proses Server

Setelah terjadi `uncaughtException`, kondisi memori internal aplikasi Node.js berada dalam status tidak terprediksi (_corrupted state_). Langkah terbaik adalah mencatat error tersebut melalui Winston, lalu membiarkan proses keluar (`process.exit(1)`) agar Process Manager (seperti PM2, Docker, atau Kubernetes Pod) dapat me-restart instans baru yang bersih.

### ⚠️ Common Pitfalls

- **Mencoba Melanjutkan Proses Normal Setelah Uncaught Exception**: Jangan pernah menelan error di `uncaughtException` dan memaksa server terus berjalan normal. Koneksi database bisa setengah terbuka, socket bisa bocor, dan data pengguna bisa korup.
- **Lupa Menangani Rejection di Event Loop Modern**: Pada versi Node.js v15 ke atas, unhandled rejection tidak lagi sekadar mencetak peringatan, melainkan langsung mematikan proses Node.js.

### 🌟 Best Practice

- **Gunakan Dedicated Exception Transport**: Selalu buat berkas terpisah seperti `exceptions.log` agar tim engineer dapat langsung membuka berkas tersebut tanpa harus mencari di antara jutaan baris log `info` biasa.

---

## 5. ✍️ Latihan Mandiri

1. Buat skrip yang menjalankan timer `setTimeout` di mana callback-nya melempar `throw new Error('Timer gagal')`.
2. Pasang Winston dengan opsi `handleExceptions: true` dan buktikan bahwa file log error tercipta sebelum proses terminasi.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [03 - File Transport & Daily Rotate Log](../03-file-and-daily-rotate/README.md)
- ➡️ **Selanjutnya:** [05 - Schema Data Validation with Joi](../../05-validation/01-joi-basics-and-schema/README.md)
- 🏠 **Daftar Isi Modul 04:** [README Modul 04](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

