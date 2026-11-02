# Third-Party Packages

> Mengintegrasikan pustaka eksternal dari registry NPM, mengevaluasi kualitas dan pemeliharaan kode sumber, serta mengamankan dependensi dari kerentanan keamanan.

## Core Concepts

- Evaluasi paket sebelum instalasi: periksa frekuensi update, popularitas mingguan (downloads), lisensi terbuka (MIT/Apache 2.0), dan rasio issue yang terselesaikan.
- Gunakan `npm audit` secara berkala untuk memindai celah keamanan (*CVE vulnerabilities*) pada dependency tree.
- Hindari menginstal paket untuk fungsi sepele yang sudah didukung secara native oleh Node.js modern (misalnya: tidak perlu `chalk` karena ada `util.styleText`, tidak perlu `uuid` karena ada `crypto.randomUUID()`).
- Di lingkungan CI/CD dan server produksi, selalu utamakan `npm ci` daripada `npm install` demi reproduktibilitas build.

## Referensi

Daftar perintah CLI pengelolaan paket pihak ketiga:

| Perintah | Opsi Flag | Fungsi |
|---|---|---|
| `npm install <pkg>` | `-D`, `-E` | Menginstal dependensi runtime atau developer |
| `npm audit` | `--json`, `--audit-level` | Memindai laporan kerentanan keamanan dependensi |
| `npm ci` | `--omit=dev` | Menginstal dependensi persis sesuai `package-lock.json` untuk CI/CD |

### `npm install <pkg>`

Perintah ini mengunduh paket dari registry publik, menempatkannya di direktori `node_modules`, dan memperbarui manifest proyek.

- `<pkg>` (string, required): Nama paket pustaka yang akan dipasang.
- `--save-dev` / `-D` (flag, optional): Menyimpan dependensi ke dalam blok `devDependencies`.
- `--save-exact` / `-E` (flag, optional): Menyimpan nomor versi persis tanpa simbol caret `^`.
- **Returns:** pembaruan berkas `package.json` dan pembaharuan pohon `node_modules`.

```bash
npm install dotenv --save-exact
# Output: added 1 package in 0.4s
```

### `npm audit`

Perintah ini menganalisis seluruh dependensi terhadap database kerentanan keamanan (*Advisory DB*).

- `--audit-level` (string, optional, default `'low'`): Batas minimum level keparahan yang dilaporkan (`low`, `moderate`, `high`, `critical`).
- `--json` (flag, optional): Menampilkan keluaran laporan dalam format JSON terstruktur untuk otomasi pipa CI.
- **Returns:** kode keluar terminal (exit code 0 jika bersih, non-zero jika ditemukan kerentanan).

```bash
npm audit --audit-level=high
# Output: found 0 vulnerabilities
```

### `npm ci`

Perintah ini melakukan instalasi bersih yang sepenuhnya deterministik langsung dari `package-lock.json`.

- `--omit=dev` (flag, optional): Mengabaikan instalasi devDependencies untuk optimasi server produksi.
- **Returns:** penataan ulang direktori `node_modules` yang identik dengan file lockfile.

```bash
npm ci --omit=dev
# Output: added 24 packages in 0.8s
```

## Examples

### 1. Evaluasi Kebutuhan Paket

```js title="src/evaluation.mjs"
// run: node src/evaluation.mjs
console.log('Third-party package evaluation and usage demonstration');
// Output: Third-party package evaluation and usage demonstration
```

## Real-World Use Case

**Tooling**

**Masalah:** pipeline CI/CD di GitHub Actions memakan waktu terlalu lama dan rentan menghasilkan build yang tidak konsisten jika developer lain memperbarui `package.json` tanpa sengaja.
**Solusi:** gunakan perintah `npm ci` di server pipeline alih-alih `npm install` agar instalasi selalu deterministik dan cepat.

```bash
# Script CI/CD Pipeline
npm ci
npm test
# Output: clean install verified, test suite executed successfully
```

## Pitfalls

- Menjalankan `npm audit fix --force` secara sembarangan, yang dapat menaikkan versi MAJOR paket dan menimbulkan breaking changes fatal.
  ```bash
  # ❌ Incorrect: risk of breaking changes from unreviewed major updates
  # npm audit fix --force

  # ✅ Correct: review vulnerabilities first and bump selectively
  npm audit
  npm update dotenv
  ```
- Menginstal library eksternal berlebihan untuk utilitas sederhana yang sudah disediakan native oleh Node.js modern.
  ```js
  // ❌ Incorrect: adding 3rd party dependency for uuid
  // import { v4 as uuidv4 } from 'uuid';

  // ✅ Correct: use built-in node:crypto
  import crypto from 'node:crypto';
  const id = crypto.randomUUID();
  console.log('Native UUID generated:', typeof id === 'string');
  // Output: Native UUID generated: true
  ```

## References

- [NPM Docs: npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [NPM Docs: npm ci](https://docs.npmjs.com/cli/v10/commands/npm-ci)

---

Sebelumnya: [02 - Dependencies & Versioning](../02-dependencies-versioning/README.md) | Berikutnya: [04 - Publish Library](../04-publish-library/README.md)
