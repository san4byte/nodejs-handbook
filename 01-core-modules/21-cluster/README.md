# Cluster

> Ringkasan
> - Tingkat: Eksplorasi
> - Fungsi: Menduplikasi satu proses Node.js menjadi beberapa proses worker yang berbagi port jaringan yang sama.

Node.js secara default berjalan pada satu thread tunggal (Event Loop). Pada server dengan banyak core CPU, modul `node:cluster` memungkinkan aplikasi membuat salinan proses worker independen via `cluster.fork()`. Seluruh worker berbagi port server yang sama, dan sistem operasi atau master process akan membagi beban koneksi yang masuk secara merata. Karena tiap worker memiliki alokasi memori heap V8 terpisah (_share-nothing architecture_), data sesi atau cache bersama wajib disimpan di penyimpanan eksternal seperti Redis.

```javascript
import cluster from "node:cluster";

console.log(cluster.isPrimary);
// Output: true
console.log(cluster.isWorker);
// Output: false
```

Dokumentasi resmi: [Node.js Cluster](https://nodejs.org/api/cluster.html)

---

## Navigasi

[Sebelumnya: DNS](../20-dns/README.md) | [Selanjutnya: Report](../22-report/README.md) | [Daftar Isi](../README.md)
