# Path & URL

> Modul `node:path` dan `node:url` menangani resolusi path sistem berkas aman lintas platform serta manipulasi URL dan query parameter berbasis standar web WHATWG.

## Core Concepts

- Windows memakai backslash (`\`), sedangkan POSIX memakai slash (`/`). Jangan lakukan konkatenasi string manual; gunakan `path.join()`.
- `path.resolve()` selalu mengembalikan path absolut berbasis `process.cwd()`.
- Kelas `URL` dan `URLSearchParams` adalah standar global WHATWG yang kompatibel dengan browser.
- Gunakan `import.meta.dirname` di ES Modules sebagai pengganti `__dirname`.

## Referensi

Daftar API modul `node:path` dan `node:url`:

| API / Fitur | Fungsi |
|---|---|
| `path.join(...paths)` | Menggabungkan segmen path dengan separator OS dan menormalkan hasilnya |
| `path.resolve(...paths)` | Menyusun path absolut dari kanan ke kiri berbasis direktori kerja |
| `path.basename(path, suffix?)` | Mengambil nama berkas terakhir dari suatu path dengan opsi pemotongan ekstensi |
| `path.extname(path)` | Mengambil ekstensi berkas mulai dari tanda titik terakhir |
| `new URL(input, base?)` | Melakukan parsing string URL relatif/absolut menjadi objek komponen WHATWG |

### `path.join(...paths)`

Fungsi ini menggabungkan urutan segmen path menjadi satu path utuh ternormalisasi sesuai separator OS.

- `...paths` (string, required): Deretan potongan segmen direktori atau nama file.
- **Returns:** string, path hasil normalisasi.

```js
import path from 'node:path';

const file = path.join('uploads', 'users', '..', 'avatars', 'pic.png');
console.log(file);
// Output: uploads/avatars/pic.png
```

### `path.resolve(...paths)`

Fungsi ini menyusun path absolut dengan memproses urutan segmen path dari kanan ke kiri.

- `...paths` (string, required): Segmen direktori yang diselesaikan ke bentuk absolut.
- **Returns:** string, path absolut lengkap.

```js
import path from 'node:path';

const abs = path.resolve('data', 'config.json');
console.log(path.isAbsolute(abs));
// Output: true
```

### `path.basename(path, suffix?)`

Fungsi ini mengambil nama berkas atau segmen paling akhir dari sebuah path.

- `path` (string, required): Path berkas target.
- `suffix` (string, optional): Ekstensi yang ingin dipotong dari string kembalian (misalnya `'.pdf'`).
- **Returns:** string, nama berkas hasil ekstraksi.

```js
import path from 'node:path';

const fullPath = '/app/docs/report.pdf';
console.log(path.basename(fullPath));
console.log(path.basename(fullPath, '.pdf'));
// Output: report.pdf
// Output: report
```

### `path.extname(path)`

Fungsi ini mengambil ekstensi berkas dari kemunculan tanda titik (`.`) terakhir.

- `path` (string, required): Path berkas target.
- **Returns:** string, ekstensi berkas termasuk titik, atau string kosong jika tidak ada ekstensi.

```js
import path from 'node:path';

console.log(path.extname('archive.tar.gz'));
console.log(path.extname('.env'));
// Output: .gz
// Output: 
```

### `new URL(input, base?)`

Konstruktor ini membedah string URL menjadi objek komponen terstruktur berbasis standar WHATWG.

- `input` (string, required): Alamat URL absolut atau path relatif.
- `base` (string | URL, optional): Alamat dasar rujukan jika `input` berupa path relatif.
- **Returns:** `URL`, objek representasi URL yang menyediakan properti `searchParams` (`URLSearchParams`).

```js
import { URL } from 'node:url';

const endpoint = new URL('/api/v1/users', 'https://api.example.com:8080');
endpoint.searchParams.append('role', 'admin');
endpoint.searchParams.append('limit', '20');

console.log('Full Origin:', endpoint.origin);
console.log('Query string:', endpoint.search);
// Output: Full Origin: https://api.example.com:8080
// Output: Query string: ?role=admin&limit=20
```

## Examples

### 1. Manipulasi Path dan URL

```js title="src/path.mjs"
// run: node src/path.mjs
import path from 'node:path';
import { URL } from 'node:url';

const target = path.join('uploads', 'report.pdf');
console.log('Joined:', target);

const endpoint = new URL('https://api.site.com/v1/search?q=node');
endpoint.searchParams.append('page', '2');
console.log('Search:', endpoint.search);
// Output: Joined: uploads/report.pdf
// Output: Search: ?q=node&page=2
```

## Real-World Use Case

**Backend**

**Masalah:** user mengirim query string `filename=../../etc/passwd` untuk membaca file di luar direktori publik (*path traversal attack*).
**Solusi:** selesaikan path secara absolut dengan `path.resolve`, lalu validasi bahwa hasilnya tetap berada di dalam folder publik yang diizinkan.

```js title="safe-path.mjs"
import path from 'node:path';

const PUBLIC_DIR = path.resolve('public');

function getSafePath(userInput) {
  const target = path.resolve(PUBLIC_DIR, userInput);
  if (!target.startsWith(PUBLIC_DIR + path.sep)) {
    throw new Error('Access denied: Path traversal detected');
  }
  return target;
}

try {
  console.log('Valid:', getSafePath('avatar.png').endsWith('avatar.png'));
  getSafePath('../../etc/passwd');
} catch (err) {
  console.log('Caught:', err.message);
}
// Output: Valid: true
// Output: Caught: Access denied: Path traversal detected
```

## Pitfalls

- Menggabungkan path dengan string concatenation `'uploads/' + filename`. Separator akan rusak di Windows; gunakan `path.join()`.
  ```js
  // ❌ Incorrect: fails on Windows OS
  const filePath = 'uploads/' + filename;

  // ✅ Correct: normalizes separators across platforms
  const filePath = path.join('uploads', filename);
  ```
- Menganggap `path.join(DIR, input)` otomatis mencegah path traversal. `path.join` hanya menormalkan string; selesaikan secara absolut dan periksa dengan `startsWith`.
  ```js
  // ❌ Incorrect: input '../../etc/passwd' still navigates outside DIR
  const unsafePath = path.join(DIR, input);

  // ✅ Correct: verifies target remains within safe boundary
  const safePath = path.resolve(DIR, input);
  if (!safePath.startsWith(DIR + path.sep)) throw new Error('Forbidden');
  ```

## References

- [Node.js Docs: Path](https://nodejs.org/api/path.html)
- [Node.js Docs: URL](https://nodejs.org/api/url.html)

---

Sebelumnya: [01 - Process & Environment](../01-process-env/README.md) | Berikutnya: [03 - File System](../03-fs/README.md)
