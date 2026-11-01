# DNS

> Ringkasan
> - Tingkat: Eksplorasi
> - Fungsi: Menerjemahkan nama domain ke alamat IP dan menginspeksi berbagai record DNS jaringan.

Modul `node:dns/promises` menyediakan antarmuka untuk resolusi nama host. Terdapat dua pendekatan utama: `dns.lookup()` yang menggunakan fasilitas sistem operasi lokal (`getaddrinfo` via Libuv thread pool) untuk memeriksa file hosts dan cache OS, serta keluarga metode `dns.resolve*()` (seperti `resolve4`, `resolveMx`, `resolveTxt`) yang langsung mengirimkan kueri jaringan ke server DNS menggunakan library c-ares tanpa melalui cache sistem operasi.

```javascript
import dns from "node:dns/promises";

const { address, family } = await dns.lookup("localhost");

console.log(typeof address);
// Output: string
console.log(family === 4 || family === 6);
// Output: true
```

Dokumentasi resmi: [Node.js DNS](https://nodejs.org/api/dns.html)

---

## Navigasi

[Sebelumnya: Net](../19-net/README.md) | [Selanjutnya: Cluster](../21-cluster/README.md) | [Daftar Isi](../README.md)
