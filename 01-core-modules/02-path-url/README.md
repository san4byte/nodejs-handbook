# Path & URL

> Modul `node:path` dan `node:url` menangani resolusi path sistem berkas aman lintas platform serta parsing URL dan manipulasi query string berbasis standar WHATWG.

## Core Concepts
- Windows memakai backslash (`\`), sedangkan POSIX memakai slash (`/`). Jangan rangkai string manual; gunakan `path.join()`.
- `path.resolve()` selalu mengembalikan path absolut berbasis `process.cwd()`.
- Gunakan trinitas `path.dirname()`, `path.basename()`, dan `path.extname()` untuk membedah elemen path berkas.
- Class global `URL` dan `URLSearchParams` adalah standar resmi WHATWG yang kompatibel langsung dengan browser.
- Di ES Modules (ESM), gunakan `import.meta.dirname` atau `fileURLToPath(import.meta.url)` sebagai pengganti `__dirname`.

## Referensi

Daftar API modul `node:path` dan `node:url`:

| API / Fitur | Fungsi |
|---|---|
| `path.join(...paths)` | Menggabungkan segmen path dengan separator OS dan menormalkan hasilnya |
| `path.resolve(...paths)` | Menyusun path absolut dari kanan ke kiri berbasis direktori kerja |
| `path.dirname(path)` | Mengambil path direktori induk dari suatu berkas atau folder |
| `path.basename(path, suffix?)` | Mengambil nama berkas terakhir dari suatu path dengan opsi pemotongan ekstensi |
| `path.extname(path)` | Mengambil ekstensi berkas mulai dari tanda titik terakhir |
| `new URL(input, base?)` | Melakukan parsing string URL relatif/absolut menjadi objek komponen WHATWG |
| `new URLSearchParams(init?)` | Mengelola parameter query string seperti menambah, mengubah, dan menghapus nilai |

### `path.join(...paths)`

Fungsi ini menggabungkan deretan segmen path menjadi satu path utuh ternormalisasi sesuai separator OS.
- `...paths` (string, wajib minimal satu): satu atau lebih potongan segmen direktori atau nama berkas.
- **Returns:** `string`, path hasil normalisasi.

```js
import path from 'node:path';

const file = path.join('uploads', 'users', '..', 'avatars', 'pic.png');
console.log(file);
// Output: uploads/avatars/pic.png
```

### `path.resolve(...paths)`

Fungsi ini menyusun path absolut dengan memproses urutan segmen path dari kanan ke kiri.
- `...paths` (string, wajib minimal satu): segmen direktori atau berkas yang diselesaikan ke bentuk absolut.
- **Returns:** `string`, path absolut lengkap.

```js
import path from 'node:path';

const abs = path.resolve('data', 'config.json');
console.log(path.isAbsolute(abs));
// Output: true
```

### `path.dirname(path)`

Fungsi ini mengambil direktori induk dari suatu path berkas atau folder.
- `path` (string, wajib): path berkas target.
- **Returns:** `string`, path direktori induk.

```js
import path from 'node:path';

console.log(path.dirname('/app/src/utils/math.js'));
// Output: /app/src/utils
```

### `path.basename(path, suffix?)`

Fungsi ini mengambil nama berkas atau segmen paling akhir dari sebuah path.
- `path` (string, wajib): path berkas target.
- `suffix` (string, opsional): ekstensi yang ingin dipotong dari string kembalian (misalnya `'.pdf'`).
- **Returns:** `string`, nama berkas hasil ekstraksi.

```js
import path from 'node:path';

const fullPath = '/app/docs/report.pdf';
console.log(path.basename(fullPath));
// Output: report.pdf
console.log(path.basename(fullPath, '.pdf'));
// Output: report
```

### `path.extname(path)`

Fungsi ini mengambil ekstensi berkas dari kemunculan tanda titik (`.`) terakhir.
- `path` (string, wajib): path berkas target.
- **Returns:** `string`, ekstensi berkas termasuk titik, atau string kosong jika tidak ada ekstensi.

```js
import path from 'node:path';

console.log(path.extname('archive.tar.gz'));
// Output: .gz
console.log(path.extname('.env'));
// Output: 
```

### `new URL(input, base?)`

Konstruktor ini membedah string URL menjadi objek komponen terstruktur berbasis standar WHATWG.
- `input` (string, wajib): alamat URL absolut atau path relatif.
- `base` (string | URL, opsional): alamat dasar rujukan jika `input` berupa path relatif.
- **Returns:** `URL`, objek representasi URL yang menyediakan properti seperti `origin`, `pathname`, dan `searchParams`.

```js
import { URL } from 'node:url';

const endpoint = new URL('/api/v1/users', 'https://api.example.com:8080');
console.log(endpoint.origin);
// Output: https://api.example.com:8080
console.log(endpoint.pathname);
// Output: /api/v1/users
```

### `new URLSearchParams(init?)`

Konstruktor ini membuat instance untuk membaca, mengubah, dan menyusun query parameter URL.
- `init` (string | object | Iterable, opsional): query string awal (contoh `'?page=1'`), objek key-value, atau array entri.
- **Returns:** `URLSearchParams`, objek pengelola query parameter dengan method seperti `.get()`, `.set()`, `.append()`, dan `.toString()`.

```js
import { URLSearchParams } from 'node:url';

let params;

params = new URLSearchParams('user=abc&query=xyz');
console.log(params.get('user'));
// Output: abc
console.log(params.toString());
// Output: user=abc&query=xyz

params = new URLSearchParams('?user=abc&query=xyz');
console.log(params.toString());
// Output: user=abc&query=xyz
```

## Examples

### 1. Manipulasi Path dan Query Parameter

```js title="src/path.mjs"
// run: node src/path.mjs
import path from 'node:path';
import { URLSearchParams } from 'node:url';

const fullPath = path.join('uploads', 'users', 'avatar.png');
console.log('Joined:', fullPath);
// Output: Joined: uploads/users/avatar.png
console.log('Dirname:', path.dirname(fullPath));
// Output: Dirname: uploads/users

const params = new URLSearchParams('sort=asc&limit=10');
params.set('page', '2');
params.append('filter', 'active');
console.log('Query:', params.toString());
// Output: Query: sort=asc&limit=10&page=2&filter=active
console.log('Sort:', params.get('sort'));
// Output: Sort: asc
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
  // Output: Valid: true
  getSafePath('../../etc/passwd');
} catch (err) {
  console.log('Caught:', err.message);
  // Output: Caught: Access denied: Path traversal detected
}
```
```

## Pitfalls
- Menggabungkan path dengan string concatenation `'uploads/' + filename`. Separator akan rusak di Windows; gunakan `path.join()`.
  ```js
  // ❌ Incorrect: fails on Windows OS
  const filePath = 'uploads/' + filename;

  // ✅ Correct: normalizes separators across platforms
  const filePath = path.join('uploads', filename);
  ```
- Mengabaikan `URLSearchParams` dan merangkai query string manual `'?search=' + input`. Karakter spesial seperti tanda plus (`+`) atau spasi akan rusak jika tidak ter-encode.
  ```js
  // ❌ Incorrect: '+' turns into a space, corrupting query values
  const query = '?search=' + 'c++ developer';

  // ✅ Correct: auto percent-encodes special characters safely
  const params = new URLSearchParams();
  params.set('search', 'c++ developer');
  const query = '?' + params.toString();
  ```

## References
- [Node.js Docs: Path](https://nodejs.org/api/path.html)
- [Node.js Docs: URL](https://nodejs.org/api/url.html)

---
Sebelumnya: [01 - Process & Environment](../01-process-env/README.md) | Berikutnya: [03 - File System](../03-fs/README.md)
