# Modul 01: Core Modules dan Runtime Architecture

Dokumentasi ini merangkum arsitektur internal runtime Node.js serta pustaka modul bawaan (_core modules_) yang tersedia secara native tanpa dependensi eksternal dari NPM.

---

## Daftar Materi Pembelajaran

1. [Standard Library](01-standard-library/README.md)
   Konsep modul bawaan native, resolusi binding C++, dan standar prefiks protokol `node:`.
2. [Globals](02-globals/README.md)
   Cakupan objek global bawaan Node.js, `globalThis`, dan integrasi Web Standards API.
3. [Process](03-process/README.md)
   Siklus hidup objek `process`, parsing argumen CLI, variabel lingkungan, metrik memori, dan graceful shutdown.
4. [OS](04-os/README.md)
   Informasi sistem operasi, perangkat keras, alokasi konkurensi CPU, dan pemantauan memori fisik.
5. [Path](05-path/README.md)
   Normalisasi jalur berkas lintas platform (POSIX dan Windows), resolusi path absolut, dan proteksi path traversal.
6. [URL](06-url/README.md)
   Standar WHATWG URL API, pemecahan komponen alamat, dan manipulasi parameter via `URLSearchParams`.
7. [File System](07-file-system/README.md)
   Operasi berkas dan direktori berbasis Promise, scanning entri direktori, pola atomic write, dan kode galat sistem.
8. [Events](08-events/README.md)
   Pola Event-Driven Architecture native via `EventEmitter`, pengelolaan listener, dan mitigasi kebocoran memori.
9. [Buffer](09-buffer/README.md)
   Alokasi dan manipulasi data biner mentah di luar V8 heap, serta konversi encoding UTF-8, Base64, dan Hex.
10. [Stream](10-stream/README.md)
    Pengolahan aliran data kontinu (Readable, Writable, Duplex, Transform) dan manajemen backpressure.
11. [Timer](11-timer/README.md)
    Fase Event Loop, penjadwalan fungsi asinkron, dan modul modern `timers/promises`.
12. [Net](12-net/README.md)
    Pemrograman jaringan soket TCP tingkat rendah berbasis client-server dua arah.
13. [DNS](13-dns/README.md)
    Resolusi nama domain ke alamat IP, perbedaan `dns.lookup` vs `dns.resolve`, dan query DNS record.
14. [HTTP](14-http/README.md)
    Pembuatan HTTP server native, parsing header dan body mentah, serta pemanggilan client request.
15. [Cluster](15-cluster/README.md)
    Penskalaan multi-proses memanfaatkan seluruh core CPU dengan pola Primary-Worker dan port sharing.
16. [Worker Threads](16-worker-threads/README.md)
    Paralelisme multi-thread untuk komputasi CPU berat tanpa memblokir Event Loop utama.
17. [Zlib](17-zlib/README.md)
    Kompresi dan dekompresi data streaming menggunakan algoritma Gzip, Deflate, dan Brotli.
18. [Readline](18-readline/README.md)
    Pembacaan input interaktif baris demi baris dari terminal dan berkas stream via `readline/promises`.
19. [Report](19-report/README.md)
    Pembuatan laporan diagnostik menyeluruh dalam format JSON untuk analisis investigasi crash.
20. [Util](20-util/README.md)
    Utilitas pembantu internal, inspeksi objek mendalam via `util.inspect`, dan utilitas konversi callback.
21. [Debugger](21-debugger/README.md)
    Titik henti program `debugger`, inspeksi nilai variabel runtime, dan integrasi V8 Inspector.
22. [Console](22-console/README.md)
    Pencetakan diagnostik, format tabular, dan pembuatan instans kustom console ke berkas disk stream.

---

## Navigasi

[Selanjutnya: Package Management](../02-package-management/README.md) | [Daftar Isi Utama](../README.md)
