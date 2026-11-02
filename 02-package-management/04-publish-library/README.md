# Publish Library

> Panduan merilis modul atau library JavaScript ke NPM Registry agar dapat diunduh dan digunakan oleh developer lain secara global.

## Core Concepts

- Kolom `"main"` dan `"exports"` di `package.json` menentukan entrypoint utama modul saat diimpor oleh aplikasi pemanggil (`import lib from 'my-pkg'`).
- Gunakan field `"files"` atau berkas `.npmignore` untuk mencegah berkas uji coba, file konfigurasi IDE, dan test masuk ke arsip paket rilis.
- Uji paket secara lokal menggunakan perintah `npm pack` sebelum melakukan publikasi langsung ke registry publik.
- Versi yang sudah dipublikasikan ke NPM bersifat immutable dan tidak boleh ditimpa; pembaruan wajib menaikkan versi SemVer baru.

## Referensi

Daftar berkas konfigurasi dan perintah publikasi pustaka NPM:

| Berkas / Perintah | Flag Opsi | Fungsi |
|---|---|---|
| `npm pack` | `--dry-run` | Membuat arsip tarball lokal (.tgz) untuk simulasi isi paket |
| `npm publish` | `--access`, `--dry-run` | Mempublikasikan paket ke registry publik NPM |
| `"files"` | - | Array whitelist berkas yang disertakan ke dalam arsip rilis |

### `npm pack`

Perintah ini membungkus direktori modul menjadi arsip tarball `.tgz` yang identik dengan apa yang akan diunduh oleh pengguna.

- `--dry-run` (flag, optional): Memeriksa daftar berkas yang akan dikemas tanpa membuat file arsip fisik di disk.
- `--pack-destination <dir>` (string, optional): Menentukan folder tempat berkas `.tgz` disimpan.
- **Returns:** nama file tarball yang dihasilkan beserta ringkasan ukuran byte.

```bash
npm pack --dry-run
# Output: Tarball Contents: index.mjs, package.json, README.md
```

### `npm publish`

Perintah ini mengunggah arsip paket ke registry NPM.

- `--access <public|restricted>` (string, optional): Menentukan visibilitas paket ber-scope (seperti `@my-org/my-pkg`).
- `--dry-run` (flag, optional): Mensimulasikan seluruh langkah otentikasi dan upload tanpa mengubah registry.
- **Returns:** status konfirmasi publikasi versi baru.

```bash
npm publish --access public --dry-run
# Output: + @my-org/mini-math@1.0.0
```

### Field `"files"`

Field konfigurasi whitelist di `package.json` yang secara eksplisit menentukan file apa saja yang diizinkan masuk ke rilis publik.

- `"files"` (string[], optional): Array pola berkas atau folder yang akan dimasukkan ke paket tarball.
- **Returns:** pembatasan berkas terunggah yang lebih aman daripada `.npmignore`.

```json
{
  "files": [
    "index.mjs",
    "dist"
  ]
}
```

## Examples

### 1. Struktur Minimal Library

```js title="src/index.mjs"
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}
// Output: Functions ready for import in consuming applications
```

## Real-World Use Case

**Tooling**

**Masalah:** memverifikasi berkas apa saja yang akan terunggah ke NPM sebelum mempublikasikannya, guna mencegah kebocoran kredensial atau token rahasia `.env`.
**Solusi:** jalankan perintah `npm pack --dry-run` di root folder library untuk memeriksa daftar isi tarball secara presisi.

```bash
# Inside library folder
npm pack --dry-run
# Output: Tarball Contents: index.mjs, package.json, README.md (total < 1 kB)
```

## Pitfalls

- Mengandalkan `.npmignore` secara longgar sehingga file konfigurasi sensitif seperti `.env` atau folder rahasia ikut terunggah.
  ```json
  // ❌ Incorrect: relying on blacklists can accidentally leak forgotten files

  // ✅ Correct: use explicit whitelist in package.json
  {
    "files": ["index.mjs", "README.md"]
  }
  ```
- Mencoba mempublikasikan ulang dengan nomor versi yang sama (`npm publish`). NPM menolak penimpaan versi yang sudah ada; naikkan versi terlebih dahulu (`npm version patch`).

## References

- [NPM Docs: Publishing Packages](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [NPM Docs: npm pack](https://docs.npmjs.com/cli/v10/commands/npm-pack)

---

Sebelumnya: [03 - Third-Party Packages](../03-third-party-packages/README.md)
