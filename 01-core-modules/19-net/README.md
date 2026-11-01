# Net

> Ringkasan
> - Tingkat: Eksplorasi
> - Fungsi: Membangun server dan client jaringan berbasis soket TCP tingkat rendah.

Modul `node:net` adalah fondasi komunikasi jaringan di Node.js yang bekerja pada lapisan transport (lapisan 4 OSI). Berbeda dengan HTTP yang berbasis request-response pesan teks, `node:net` menyediakan koneksi stream dua arah berbasis byte mentah (_bidirectional stream of bytes_). Modul ini umum dipakai saat kamu perlu membangun protokol kustom, broker pesan ringan, proxy TCP, atau komunikasi antar-proses (IPC).

```javascript
import net from "node:net";

const server = net.createServer((socket) => {
  socket.write("PONG\n");
  socket.end();
});

server.listen(0, () => {
  const port = server.address().port;
  const client = net.createConnection({ port }, () => {
    client.on("data", (chunk) => {
      console.log(chunk.toString().trim());
      client.end();
      server.close();
    });
  });
});
// Output:
// PONG
```

Dokumentasi resmi: [Node.js Net](https://nodejs.org/api/net.html)

---

## Navigasi

[Sebelumnya: Child Process](../18-child-process/README.md) | [Selanjutnya: DNS](../20-dns/README.md) | [Daftar Isi](../README.md)
