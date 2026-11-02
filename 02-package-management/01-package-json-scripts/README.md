# Package JSON & Scripts

> File `package.json` adalah manifest utama proyek Node.js yang mendefinisikan metadata, daftar dependensi, perintah scripts automasi, serta mode modul runtime.

## Core Concepts

- Kolom `"type": "module"` mengaktifkan ES Modules secara default untuk semua file `.js` di dalam folder proyek. Jika tidak ditentukan, defaultnya adalah CommonJS.
- Blok `"scripts"` memungkinkan registrasi pintasan perintah CLI (misal: `npm run build`, `npm test`). Perintah `start` dan `test` dapat dipanggil langsung tanpa kata kunci `run`.
- `package-lock.json` mengunci pohon dependensi secara presisi (versi exact, URL hash SHA-512) demi konsistensi antar mesin developer dan server CI/CD.
- Blok `"exports"` modern menggantikan field `"main"` untuk mengontrol titik masuk modul publik secara ketat.

## Referensi

Daftar properti utama pada `package.json`:

| Field / Properti | Fungsi |
|---|---|
| `"type"` | Menentukan sistem modul default (`"module"` untuk ESM, `"commonjs"` untuk CJS) |
| `"scripts"` | Objek pintasan perintah CLI yang dieksekusi melalui NPM |
| `"exports"` | Mendefinisikan titik masuk modul publik dan pemetaan kondisional impor |

### `"type"`

Field ini mengatur parser modul Node.js untuk mengevaluasi seluruh berkas ekstensi `.js`.

- `"type"` (string, optional, default `"commonjs"`): Nilai berupa `"module"` untuk mengaktifkan sintaks ES Modules (`import`/`export`), atau `"commonjs"` untuk `require`.
- **Returns:** konfigurasi format modul runtime untuk direktori proyek terkait.

```json
{
  "type": "module"
}
```

### `"scripts"`

Field ini menyimpan pemetaan pintasan perintah baris perintah shell automasi.

- `"scripts"` (Record<string, string>, optional): Pasangan nama script kustom dan perintah terminal yang dijalankan melalui `npm run <nama>`.
- **Returns:** perintah baris perintah yang dieksekusi dalam sub-shell.

```json
{
  "scripts": {
    "start": "node index.mjs",
    "test": "node --test",
    "lint": "eslint ."
  }
}
```

### `"exports"`

Field modern ini mendefinisikan batas titik masuk (*entry points*) publik yang boleh diimpor oleh aplikasi pemanggil.

- `"exports"` (string | Record<string, any>, optional): Pemetaan subpath berkas ekspor publik paket, mendukung kondisi seperti `"import"` dan `"require"`.
- **Returns:** pemetaan path resolusi modul Node.js.

```json
{
  "exports": {
    ".": "./index.js",
    "./utils": "./src/utils.js"
  }
}
```

## Examples

### 1. Struktur Minimal package.json

```json title="package.json"
{
  "name": "my-service",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.mjs",
    "dev": "node --watch index.mjs",
    "test": "node --test tests/*.test.mjs"
  }
}
// Output: Valid manifest structure recognized by Node.js runtime
```

## Real-World Use Case

**Tooling**

**Masalah:** developer harus mengetik flag panjang `node --watch --env-file=.env app.mjs` berulang kali setiap memulai sesi development lokal.
**Solusi:** daftarkan script `dev` di dalam `package.json` sehingga seluruh tim menggunakan alur kerja yang seragam.

```json title="package.json"
{
  "scripts": {
    "dev": "node --watch app.mjs"
  }
}
// Output command: npm run dev
// Output behavior: Runs application with automatic restart on file change
```

## Pitfalls

- Lupa menambahkan `"type": "module"` saat menggunakan sintaks `import ... from` di berkas `.js`.
  ```json
  // ❌ Incorrect: causes SyntaxError: Cannot use import statement outside a module
  {
    "name": "my-app"
  }

  // ✅ Correct: declare ES module format explicitly
  {
    "name": "my-app",
    "type": "module"
  }
  ```
- Mengedit berkas `package-lock.json` secara manual. Perubahan manual berisiko merusak integritas checksum tree dependensi; biarkan NPM memperbaruinya secara otomatis melalui CLI.

## References

- [NPM Docs: package.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)

---

Berikutnya: [02 - Dependencies & Versioning](../02-dependencies-versioning/README.md)
