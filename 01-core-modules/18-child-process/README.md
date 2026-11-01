# Child Process

> Ringkasan
> - Tingkat: Pendukung
> - Fungsi: Menjalankan program eksternal, biner sistem operasi, atau skrip sub-proses di luar proses Node.js utama.
> - Digunakan saat: Menjalankan tool CLI pihak ketiga (seperti git, ffmpeg, linter), memproses tugas terisolasi di sub-proses terpisah, atau mengeksekusi skrip antarbahasa pemrograman.
> - Aturan praktis: Prioritaskan `spawn` atau `execFile` daripada `exec` untuk mencegah kerentanan Command Injection dan menghindari luapan buffer memori pada output stream yang besar.

## Cheat Sheet

| Tugas | Kode |
| :--- | :--- |
| Menjalankan perintah eksternal dengan streaming | `const child = spawn(command, args, options);` |
| Menjalankan file biner langsung tanpa shell | `execFile(file, args, options, callback);` |
| Menjalankan perintah di dalam shell OS | `exec(command, options, callback);` |
| Menjalankan modul Node.js dengan saluran IPC bawaan | `const child = fork(modulePath, args, options);` |
| Membaca output stdout sub-proses secara streaming | `for await (const chunk of child.stdout) { ... }` |
| Mengirimkan sinyal penghentian ke sub-proses | `child.kill("SIGTERM");` |

## Tujuan Belajar

- Membedakan karakteristik penggunaan antara `spawn`, `execFile`, `exec`, dan `fork`.
- Mengalirkan output sub-proses secara hemat memori menggunakan `spawn` dan async iterator.
- Mencegah bahaya keamanan *Command Injection* dengan mengeksekusi biner langsung lewat `execFile`.
- Berkomunikasi antar-proses menggunakan kanal IPC bawaan dari `fork`.
- Mengendalikan siklus hidup proses anak melalui pengiriman sinyal terminasi dan pemantauan kode keluar.

## Konsep

Bayangkan kantor pos pusat yang sibuk. Di meja pelayanan utama, ada staf administrasi yang melayani antrean paket pelanggan (proses utama Node.js). Saat ada kiriman raksasa antarprovinsi yang memerlukan armada truk kontainer, staf loket tidak meninggalkan mejanya untuk menyetir truk sendiri, melainkan menyewa kurir ekspedisi independen (`child_process`). Kurir ini bekerja di luar gedung pos, berkomunikasi lewat radio dua arah (stream `stdout`, `stderr`, atau IPC), lalu melapor saat pekerjaannya selesai (`exit code`). Jika muatan barang sangat banyak, kurir membawanya berangsur-angsur dengan conveyor belt (`spawn`), bukan menimbun seluruh barang sekaligus di dalam bagasi mobil sampai mogok (`exec`).

```mermaid
flowchart TD
    PARENT["Proses Node.js Utama (Event Loop)"] -->|spawn / execFile| CHILD["Child Process (OS Binary / Skrip)"]
    PARENT -->|fork (IPC Channel)| FORKED["Sub-proses Node.js (Worker Script)"]
    CHILD -->|child.stdout| PARENT
    CHILD -->|child.stderr| PARENT
    CHILD -->|exit event (code 0 / 1)| PARENT
```

## Referensi

| Item | Fungsi | Catatan |
| :--- | :--- | :--- |
| `spawn(command, args, options)` | Menjalankan perintah dengan stream output asinkron | Pilihan utama untuk output besar atau proses berdurasi panjang |
| `execFile(file, args, options, callback)` | Menjalankan biner sistem langsung tanpa perantara shell | Aman dari manipulasi string command injection |
| `exec(command, options, callback)` | Menjalankan baris perintah di dalam shell OS | Menampung seluruh output ke buffer sebelum callback |
| `fork(modulePath, args, options)` | Menjalankan modul JavaScript dengan kanal komunikasi IPC | Khusus untuk sub-proses berbasis Node.js |
| `child.stdout` dan `child.stderr` | Stream readable penyalur output standar dan error | Mendukung perulangan `for await...of` atau event listener |
| `child.kill(signal)` | Mengirim sinyal penghentian OS ke sub-proses | Default sinyal terminasi adalah `'SIGTERM'` |

### `spawn(command, args, options)`

`spawn()` melahirkan sub-proses baru dengan mengalirkan data output secara bertahap lewat stream, tanpa membebani memori utama aplikasi induk.

Struktur parameter: `spawn(command, args, options)`

- `command` (string, wajib): nama program biner atau perintah yang ingin dijalankan (contoh: `'node'`, `'git'`).
- `args` (array string, opsional, default: `[]`): daftar argumen baris perintah terpisah.
- `options` (object, opsional, default: `{}`): konfigurasi lingkungan sub-proses (seperti `cwd`, `env`, `shell`).

Nilai kembalian: instance kontrol sub-proses (`ChildProcess`).

```javascript
import { spawn } from "node:child_process";

const child = spawn("node", ["-e", "console.log('Halo spawn')"]);

for await (const chunk of child.stdout) {
  console.log(chunk.toString().trim());
}
// Output: Halo spawn
```

Kondisi khusus dan penanganan error: jika biner pada argumen `command` tidak ditemukan pada variabel sistem PATH, sub-proses memicu event `'error'` dengan kode `ENOENT`.

### `execFile(file, args, options, callback)`

`execFile()` mengeksekusi biner file secara langsung tanpa membungkusnya dalam shell sistem operasi (`sh` atau `cmd.exe`), menjadikannya kebal dari injeksi karakter shell liar.

Struktur parameter: `execFile(file, args, options, callback)`

- `file` (string, wajib): path atau nama biner yang ingin dieksekusi.
- `args` (array string, opsional, default: `[]`): argumen baris perintah dalam bentuk array.
- `options` (object, opsional, default: `{}`): opsi konfigurasi seperti `timeout` (dalam milidetik) dan `maxBuffer`.
- `callback` (function, opsional jika memakai `promisify`): fungsi `(error, stdout, stderr) => void`.

Nilai kembalian: instance `ChildProcess`. Jika dibungkus `util.promisify`, mengembalikan Promise `{ stdout, stderr }`.

```javascript
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const { stdout } = await execFileAsync("node", ["-v"]);

console.log(stdout.trim().startsWith("v"));
// Output: true
```

Kondisi khusus dan penanganan error: jika sub-proses keluar dengan kode selain 0, Promise ditolak dengan error yang memuat properti `code`, `stdout`, dan `stderr`.

### `exec(command, options, callback)`

`exec()` mengeksekusi seluruh string perintah di dalam shell sistem operasi dan menampung seluruh output ke buffer memori sebelum meneruskannya ke callback.

Struktur parameter: `exec(command, options, callback)`

- `command` (string, wajib): seluruh baris perintah yang ingin dijalankan di shell.
- `options` (object, opsional, default: `{}`): konfigurasi lingkungan, direktori kerja, batas memori `maxBuffer`, dan `timeout`.
- `callback` (function, opsional jika memakai `promisify`): fungsi penanganan `(error, stdout, stderr) => void`.

Nilai kembalian: instance `ChildProcess` atau Promise `{ stdout, stderr }`.

```javascript
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const { stdout } = await execAsync("node -v");

console.log(stdout.trim().startsWith("v"));
// Output: true
```

Kondisi khusus dan penanganan error: jika total teks output melebihi batas `maxBuffer` (default 1 MB), proses dimatikan paksa dengan error `ERR_CHILD_PROCESS_STDIO_MAXBUFFER`.

### `fork(modulePath, args, options)`

`fork()` adalah varian khusus `spawn()` untuk menjalankan file modul Node.js baru dengan saluran komunikasi antar-proses (*Inter-Process Communication* / IPC) yang sudah terhubung otomatis.

Struktur parameter: `fork(modulePath, args, options)`

- `modulePath` (string, wajib): path file modul JavaScript yang akan dieksekusi oleh biner Node.js baru.
- `args` (array string, opsional, default: `[]`): argumen baris perintah untuk modul anak.
- `options` (object, opsional, default: `{}`): opsi konfigurasi eksekusi.

Nilai kembalian: instance `ChildProcess` dengan metode tambahan `child.send()` dan event `'message'`.

```javascript
import { fork } from "node:child_process";

// Menyiapkan sub-proses modul dengan kanal komunikasi IPC
const child = fork("./worker-task.mjs", [], { silent: true });
console.log(typeof child.send);
// Output: function
child.kill();
```

> **Catatan Pengujian:** Contoh di atas mengasumsikan file `./worker-task.mjs` tersedia. Metode `child.send()` dipakai untuk mengirim objek JavaScript secara dua arah antara proses induk dan anak.

Kondisi khusus dan penanganan error: setiap pemanggilan `fork()` membuat instance runtime V8 baru yang membutuhkan alokasi memori tersendiri (sekitar 30 MB RAM per proses anak).

### `child.kill(signal)`

`child.kill()` mengirimkan sinyal sistem operasi ke proses anak untuk memintanya berhenti secara normal atau mematikannya secara paksa.

Struktur parameter: `child.kill(signal)` menerima satu parameter `signal` (string atau number, opsional, default: `'SIGTERM'`).

Nilai kembalian: boolean bernilai `true` jika sinyal berhasil dikirim ke OS (`boolean`).

```javascript
import { spawn } from "node:child_process";

const child = spawn("node", ["-e", "setInterval(() => {}, 1000)"]);
console.log(typeof child.pid);
// Output: number

const success = child.kill("SIGTERM");
console.log(success);
// Output: true
```

Kondisi khusus dan penanganan error: mengirim sinyal ke proses yang sudah mati mengembalikan nilai `false` tanpa melempar error.

## Kesalahan Umum

### Kerentanan Command Injection Akibat String Shell Mentah

Menggabungkan input yang belum divalidasi ke dalam argumen string `exec()` memungkinkan penyerang menyisipkan pemisah perintah (seperti `;`, `&&`, atau `|`) untuk menjalankan skrip berbahaya di server.

```javascript
// Salah: input user disambung langsung ke string shell exec
const userFolder = "docs; rm -rf /";
exec(`ls -l ${userFolder}`, (err, stdout) => { ... });
```

```javascript
// Benar: gunakan execFile atau spawn dengan array argumen terisolasi
const userFolder = "docs";
execFile("ls", ["-l", userFolder], (err, stdout) => { ... });
```

### Memakai `exec()` untuk Memproses Volume Data Besar

`exec()` menyimpan seluruh teks output di dalam buffer memori internal Node.js. Saat biner eksternal menghasilkan puluhan ribu baris output, batas `maxBuffer` akan terlampaui dan aplikasi crash mendadak.

```javascript
// Salah: output masif ditampung ke buffer memori exec
exec("generate-big-log-dump", (err, stdout) => { ... });
```

```javascript
// Benar: konsumsi data secara bertahap lewat stream spawn
const child = spawn("generate-big-log-dump");
child.stdout.on("data", (chunk) => {
  // memproses bongkahan buffer sepotong demi sepotong
});
```

## Studi Kasus

Skenario: Pengelola eksekusi tugas eksternal yang aman (`SafeTaskRunner`) menggunakan `execFile` dengan pembatasan waktu (*timeout*), pengisolasian argumen, dan penangkapan kode keluar (*exit code*).

```javascript
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

class SafeTaskRunner {
  constructor(timeoutMs = 5000) {
    this.timeoutMs = timeoutMs;
  }

  async runNodeScript(codeString) {
    try {
      const { stdout, stderr } = await execFileAsync(
        "node",
        ["-e", codeString],
        {
          timeout: this.timeoutMs,
          maxBuffer: 512 * 1024,
        }
      );

      return {
        success: true,
        output: stdout.trim(),
        error: stderr.trim(),
      };
    } catch (err) {
      return {
        success: false,
        output: err.stdout?.trim() || "",
        error: err.stderr?.trim() || err.message,
        code: typeof err.code === "number" ? err.code : 1,
      };
    }
  }
}

const runner = new SafeTaskRunner(2000);

const okResult = await runner.runNodeScript("console.log('Tugas selesai')");
console.log(okResult.success);
// Output: true
console.log(okResult.output);
// Output: Tugas selesai

const failResult = await runner.runNodeScript("process.exit(1)");
console.log(failResult.success);
// Output: false
console.log(failResult.code);
// Output: 1
```

Pola ini membungkus eksekusi kode eksternal dalam sandbox waktu dan memori yang terkendali sehingga kegagalan sub-proses tidak merusak alur aplikasi utama.

## Latihan Mandiri

Buat fungsi `runExternalCommand(command, args = [], options = {})` untuk menjalankan program eksternal secara aman dan terisolasi.

- **Level 1 (Dasar):** Jalankan perintah biner `command` beserta array argumen `args` memakai `execFile` yang dibungkus `promisify`. Kembalikan objek `{ success: true, stdout: string, stderr: string, exitCode: 0 }`.
- **Level 2 (Menengah):** Tangani kasus saat program eksternal keluar dengan error (exit code non-zero). Tangkap error tersebut dan kembalikan objek `{ success: false, stdout: string, stderr: string, exitCode: number }` tanpa melempar kegagalan unhandled rejection ke pemanggil fungsi.
- **Level 3 (Menantang):** Dukung opsi `options.timeout` (angka milidetik batas eksekusi) dan `options.disallowedCommands` (array string daftar biner terlarang, misal `["sudo", "rm", "sh"]`). Jika `command` yang diminta terdaftar di `disallowedCommands`, lempar `Error("Perintah dilarang: [namaCommand]")`. Pastikan opsi `timeout` membatalkan proses yang menggantung.

Contoh input dan output normal:

```javascript
const res = await runExternalCommand("node", ["-e", "console.log('Sukses')"]);

console.log(res.success);
// Output: true
console.log(res.stdout);
// Output: Sukses
console.log(res.exitCode);
// Output: 0
```

Contoh eksekusi gagal dan larangan perintah:

```javascript
const fail = await runExternalCommand("node", ["-e", "process.exit(2)"]);

console.log(fail.success);
// Output: false
console.log(fail.exitCode);
// Output: 2

try {
  await runExternalCommand("sudo", ["ls"], { disallowedCommands: ["sudo", "rm"] });
} catch (err) {
  console.log(err.message);
  // Output: Perintah dilarang: sudo
}
```

Tanda selesai:
- [ ] Biner eksternal dijalankan langsung melalui `execFile` tanpa memanggil shell OS.
- [ ] Eksekusi normal menghasilkan status sukses dengan exit code 0.
- [ ] Kegagalan sub-proses ditangkap secara elegan dengan kode keluar yang sesuai.
- [ ] Daftar perintah terlarang pada `disallowedCommands` memicu error pencegahan.
- [ ] Seluruh contoh kode teruji tanpa error syntax atau output yang meleset.

---

## Navigasi

[Sebelumnya: Console](../17-console/README.md) | [Selanjutnya: Net](../19-net/README.md) | [Daftar Isi](../README.md)
