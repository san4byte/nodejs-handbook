# 📘 Modul 02: Package Management & Library Ecosystem

Selamat datang di **Modul 02**! Modul ini membahas secara mendalam ekosistem manajemen dependensi Node.js menggunakan NPM (Node Package Manager), konfigurasi berkas `package.json`, skrip otomatisasi tugas, semantic versioning, konsumsi modul pihak ketiga, hingga pembuatan dan publikasi library ke NPM Registry.

---

## 📚 Daftar Materi Pembelajaran

1. [01 - Package JSON & Scripts Automation](01-package-json-and-scripts/README.md)
   - Struktur manifes `package.json`, properti `exports`, siklus lifecycle scripts (`pre`, `post`, `dev`, `start`), dan modul entrypoint.
2. [02 - Semantic Versioning & Dependencies Rule](02-dependencies-and-versioning/README.md)
   - Konvensi SemVer `MAJOR.MINOR.PATCH`, operator versi (`^`, `~`, `*`, `exact`), serta perbedaan mendasar `dependencies` vs `devDependencies`.
3. [03 - Menggunakan Third-Party Packages](03-third-party-packages/README.md)
   - Instalasi paket via NPM, integrasi pustaka eksternal industri (`lodash`, `moment`), serta resolusi sub-path modul ES.
4. [04 - Membangun & Publikasi Library NPM](04-publishing-npm-library/README.md)
   - Arsitektur pembuatan reusable module, konfigurasi `.npmignore`, multiple export endpoints (`./number`), dan prosedur `npm publish`.

---

## 🛠️ Cara Menjalankan

Masuk ke direktori modul ini dan pasang seluruh dependensi terlebih dahulu:

```bash
cd 02-package-management
npm install

# Menjalankan skrip via NPM
npm run dev

# Menjalankan contoh third-party library
npm run lodash
npm run moment
```

---

## 🧭 Navigasi

- ⬅️ **Modul Sebelumnya:** [01 - Node.js Core Modules & Runtime Architecture](../01-core-modules/README.md)
- ➡️ **Modul Selanjutnya:** [03 - Node.js Unit Testing with Jest](../03-unit-test/README.md)
- 📑 **Daftar Isi Utama:** [Kembali ke Root README](../README.md)

