# Debugger

> Ringkasan
> - Tingkat: Eksplorasi
> - Fungsi: Menghentikan eksekusi kode pada titik tertentu dan menelusuri alur baris demi baris via protokol V8 Inspector.

Menelusuri bug rumit di aplikasi server sering kali tidak cukup hanya dengan `console.log()`. Pernyataan `debugger;` memungkinkan developer meletakkan titik henti (_breakpoint_) terprogram. Saat aplikasi dijalankan dengan perintah `node --inspect` atau `node inspect`, Node.js membuka port protokol Chrome DevTools Protocol (CDP) sehingga developer dapat menelusuri variabel, memeriksa call stack, dan mengevaluasi ekspresi secara langsung dari terminal atau visual browser.

```javascript
import inspector from "node:inspector";

// Memeriksa status sesi inspector aktif
console.log(inspector.url() === undefined);
// Output: true
```

Dokumentasi resmi: [Node.js Debugger](https://nodejs.org/api/debugger.html)

---

## Navigasi

[Sebelumnya: Report](../22-report/README.md) | [Daftar Isi](../README.md)
