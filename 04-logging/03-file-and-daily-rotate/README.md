# 03 - File Transport & Daily Rotate Log

> ⏱️ **TL;DR (Ringkasan Cepat):**
>
> - **Fungsi Utama**: Menyimpan rekaman riwayat log aplikasi secara persisten ke dalam media penyimpanan hard disk server menggunakan `winston.transports.File` dan melakukan peremajaan berkas otomatis via `winston-daily-rotate-file`.
> - **Kapan Digunakan**: Digunakan saat aplikasi berjalan di Virtual Private Server (VPS), server on-premise, atau server mandiri yang membutuhkan penyimpanan arsip audit jejak transaksi tanpa bergantung pada layanan cloud pihak ketiga.
> - **Aturan Praktis**: Pisahkan berkas log error ke file terpisah (`filename: 'error.log', level: 'error'`). Selalu aktifkan fitur kompresi (`zippedArchive: true`) dan batas umur berkas (`maxFiles: '14d'`) agar disk tidak penuh.

---

## 1. 🎯 Tujuan Belajar

- Memahami cara kerja transport berkas fisik: `new winston.transports.File({ filename })`.
- Memisahkan aliran log umum (`combined.log`) dengan aliran log kegagalan khusus (`error.log`).
- Menguasai plugin industri `winston-daily-rotate-file`: pola nama tanggal `%DATE%`, batas ukuran maksimal per berkas (`maxSize`), kompresi zip otomatis, dan retensi berkas (`maxFiles`).
- Menghindari risiko crash server akibat disk penuh (_No space left on device_).

---

## 2. 📖 Penjelasan Konsep & API Reference

### 🎭 Analogi Dunia Nyata

> Bayangkan rotasi berkas log seperti **buku tamu di lobi hotel berbintang**:
>
> - Jika hotel hanya menyediakan **satu buku tamu tunggal yang dipakai bertahun-tahun tanpa henti**, buku tersebut lama-kelamaan akan menjadi setebal 10 meter, robek, berat, dan mustahil dibuka.
> - Sistem hotel yang cerdas menggunakan **buku harian baru setiap hari** (`app-%DATE%.log`).
> - Buku tamu yang umurnya sudah lebih dari 14 hari akan dibundel ke kardus arsip berukuran padat (`zippedArchive: true`), dan buku tamu yang umurnya lebih dari 30 hari akan dimusnahkan secara berkala (`maxFiles: '30d'`).

---

### Konfigurasi Kunci `DailyRotateFile`

| Parameter | Tipe Data | Contoh Nilai | Penjelasan Fungsi |
| :--- | :--- | :--- | :--- |
| `filename` | `string` | `'application-%DATE%.log'` | Pola nama berkas dengan placeholder tanggal `%DATE%` |
| `datePattern` | `string` | `'YYYY-MM-DD'` | Format tanggal pola rotasi (harian, per jam, per menit) |
| `zippedArchive` | `boolean` | `true` | Otomatis mengompresi berkas log lama menjadi `.gz` |
| `maxSize` | `string` | `'20m'` atau `'1g'` | Batas ukuran maksimal satu berkas sebelum dipecah menjadi file baru |
| `maxFiles` | `string` / `number` | `'14d'` atau `10` | Batas retensi: berkas lebih dari 14 hari akan dihapus otomatis |

---

### Pembahasan Mendalam Fitur

#### 1. Multi-File Transport (Pemisahan Error Log)

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    // 1. Mencatat semua log (info, warn, error)
    new winston.transports.File({ filename: 'combined.log' }),

    // 2. HANYA mencatat error saja
    new winston.transports.File({ filename: 'error.log', level: 'error' }),

    // 3. Output konsol untuk developer
    new winston.transports.Console()
  ]
});
```

#### 2. Konfigurasi Daily Rotate Log

```javascript
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const rotateTransport = new DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m', // Maksimal 10 MB per file
  maxFiles: '14d'  // Simpan selama 14 hari terakhir
});

const logger = winston.createLogger({
  transports: [rotateTransport]
});
```

---

## 3. 💻 Kode Praktik Terpadu

Berkas test yang menerapkan konsep ini dalam repositori:
- [`logger.test.js`](../test/logger.test.js) (test case `'file transport logger file'`): Konfigurasi dual-file transport (`transport.log` dan `transport-error.log`).
- [`logger.test.js`](../test/logger.test.js) (test case `'file rotate file'`): Simulasi 30.000 log dengan rotasi berkas otomatis `app-%Date%.log`.

Jalankan test terkait secara langsung di terminal Anda:

```bash
cd 04-logging
npm test -- -t "file transport logger file"
npm test -- -t "file rotate file"
```

---

## 4. 💡 Panduan Praktis & Studi Kasus

### 🏢 Real-World Use Case: Memenuhi Kepatuhan Audit Regulasi Perbankan (Compliance)

Aplikasi finansial diwajibkan menyimpan log audit transaksi selama minimal 90 hari tanpa boleh ada log yang terpotong. Konfigurasi `maxFiles: '90d'` dengan `zippedArchive: true` memastikan seluruh riwayat aman tersimpan dengan penggunaan kapasitas hard disk yang sangat hemat.

### ⚠️ Common Pitfalls

- **Tidak Membatasi Ukuran File (Tanpa `maxSize` & `maxFiles`)**: Menyimpan log ke satu file tunggal di server production selama setahun dapat menghasilkan file raksasa berukuran puluhan Gigabyte yang membuat server macet kehabisan disk space.
- **Membiarkan Log Masuk ke Git Repository**: Pastikan pola berkas `*.log` terdaftar di `.gitignore` agar commit git repositori tidak membengkak dengan data log lokal.

### 🌟 Best Practice

- **Pastikan Direktori Target Memiliki Izin Tulis (Write Permissions)**: Pastikan user Linux yang menjalankan proses Node.js memiliki hak akses tulis penuh (`chmod / chown`) ke folder direktori `logs/`.

---

## 5. ✍️ Latihan Mandiri

1. Buat rotasi berkas log dengan pola per jam: `datePattern: 'YYYY-MM-DD-HH'` dan setel `maxSize: '500k'`.
2. Tulis loop yang mencetak 5.000 pesan log dan periksa berkas arsip terkompresi yang dihasilkan oleh Winston.

---

## 6. 🧭 Navigasi

- ⬅️ **Sebelumnya:** [02 - Transports & Log Formatting](../02-transports-and-formats/README.md)
- ➡️ **Selanjutnya:** [04 - Exception & Rejection Handlers](../04-exception-and-rejections/README.md)
- 🏠 **Daftar Isi Modul 04:** [README Modul 04](../README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../../README.md)

