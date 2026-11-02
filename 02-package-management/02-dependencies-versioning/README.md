# Dependencies & Versioning

> Semantic Versioning (SemVer) adalah format standar penomoran rilis perangkat lunak untuk menjaga kompatibilitas ketergantungan paket aplikasi.

## Core Concepts

- Format nomor versi SemVer: `MAJOR.MINOR.PATCH` (contoh: `2.4.1`).
  - **MAJOR:** perubahan yang merusak kompatibilitas sebelumnya (*breaking change*).
  - **MINOR:** penambahan fitur baru yang tetap kompatibel dengan versi sebelumnya (*backward-compatible*).
  - **PATCH:** perbaikan bug yang kompatibel (*bug fixes*).
- Simbol Caret (`^1.2.3`): memperbolehkan pembaruan MINOR dan PATCH (rentang `>= 1.2.3 < 2.0.0`).
- Simbol Tilde (`~1.2.3`): hanya memperbolehkan pembaruan PATCH (rentang `>= 1.2.3 < 1.3.0`).
- Versi eksak (`1.2.3` tanpa simbol): mengunci paket pada versi tersebut secara ketat.

## Referensi

Daftar pengelompokan dependensi di `package.json`:

| Kategori | Flag Install | Fungsi |
|---|---|---|
| `dependencies` | `npm i <pkg>` | Paket yang dibutuhkan saat aplikasi berjalan di server produksi |
| `devDependencies` | `npm i -D <pkg>` | Tool yang hanya dipakai saat pengembangan lokal dan build |
| `peerDependencies` | - | Paket yang diharapkan sudah dipasang oleh host pemanggil library |

### `dependencies`

Kamus ini mendaftarkan seluruh library yang wajib hadir saat aplikasi dijalankan di lingkungan produksi runtime.

- `dependencies` (Record<string, string>, optional): Pasangan nama paket dan rentang versi SemVer yang dibutuhkan saat aplikasi beroperasi.
- **Returns:** pohon modul produksi yang diinstal ke dalam folder `node_modules`.

```json
{
  "dependencies": {
    "dotenv": "^16.4.5"
  }
}
```

### `devDependencies`

Kamus ini memisahkan paket-paket pendukung tahap pengembangan dari bundle produksi.

- `devDependencies` (Record<string, string>, optional): Paket penunjang seperti test runner, compiler, linter, dan formatter.
- **Returns:** paket yang diabaikan saat proses instalasi dengan flag `--omit=dev`.

```json
{
  "devDependencies": {
    "eslint": "^9.0.0"
  }
}
```

### Simbol Rentang SemVer (`^` dan `~`)

Operator prefiks versi menentukan fleksibilitas pembaruan otomatis paket saat menjalankan `npm update` atau `npm install`.

- `^` (Caret, operator SemVer): Mengizinkan peningkatan patch dan minor (`>= 1.2.3 < 2.0.0`).
- `~` (Tilde, operator SemVer): Hanya mengizinkan peningkatan patch bug fix (`>= 1.2.3 < 1.3.0`).
- **Returns:** resolusi versi paket yang diizinkan oleh package manager.

```json
{
  "dependencies": {
    "express": "^4.19.2",
    "cors": "~2.8.5",
    "strict-lib": "1.0.0"
  }
}
// Output: NPM resolves package versions within designated SemVer boundaries
```

## Examples

### 1. Deklarasi Dependensi Terpisah

```json title="package.json"
{
  "dependencies": {
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "eslint": "^9.0.0"
  }
}
// Output: eslint is only installed in local dev and CI builds
```

## Real-World Use Case

**Tooling**

**Masalah:** image container Docker untuk server produksi menjadi terlalu besar (membengkak hingga ratusan MB) karena paket testing dan linter ikut terpasang.
**Solusi:** jalankan perintah `npm ci --omit=dev` saat build Docker image produksi agar hanya menginstal `dependencies` esensial.

```bash
# Dockerfile build step
npm ci --omit=dev
# Output: added 45 packages in 1.2s (zero devDependencies installed)
```

## Pitfalls

- Menggunakan operator wildcard `*` untuk dependensi kritis. Hal ini berisiko mengunduh rilis mayor baru yang memuat breaking change tanpa disadari.
  ```json
  // ❌ Incorrect: dangerously allows breaking major upgrades
  {
    "dependencies": {
      "database-driver": "*"
    }
  }

  // ✅ Correct: restrict upgrades within safe major version boundary
  {
    "dependencies": {
      "database-driver": "^2.1.0"
    }
  }
  ```
- Menempatkan pustaka runtime (seperti driver database atau token validator) ke dalam `devDependencies`. Server produksi yang dijalankan dengan `--omit=dev` akan crash karena modul tidak ditemukan.

## References

- [SemVer Specification](https://semver.org/)
- [NPM Docs: Dependencies](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#dependencies)

---

Sebelumnya: [01 - Package JSON & Scripts](../01-package-json-scripts/README.md) | Berikutnya: [03 - Third-Party Packages](../03-third-party-packages/README.md)
