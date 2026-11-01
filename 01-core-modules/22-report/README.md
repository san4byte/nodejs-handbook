# Report

> Ringkasan
> - Tingkat: Eksplorasi
> - Fungsi: Menghasilkan dokumen laporan diagnostik JSON mendalam untuk investigasi crash dan performa.

Saat aplikasi backend mengalami crash mendadak di produksi, penyelidikan pasca-kematian proses (_post-mortem debugging_) membutuhkan visibilitas kondisi internal. Fitur `process.report` merangkum status mesin V8 (heap statistics), antrean event Libuv, jejak stack call, resource OS, hingga metadata lingkungan ke dalam format terstruktur JSON. Laporan dapat diambil langsung di memori dengan `process.report.getReport()` atau ditulis ke file disk via `process.report.writeReport()`.

```javascript
const report = process.report.getReport();

console.log(typeof report);
// Output: object
console.log(report.header.nodejsVersion.startsWith("v"));
// Output: true
```

Dokumentasi resmi: [Node.js Diagnostic Reports](https://nodejs.org/api/report.html)

---

## Navigasi

[Sebelumnya: Cluster](../21-cluster/README.md) | [Selanjutnya: Debugger](../23-debugger/README.md) | [Daftar Isi](../README.md)
