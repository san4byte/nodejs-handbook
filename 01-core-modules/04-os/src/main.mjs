import os from 'node:os';

// 1. OS & Arsitektur
console.log('--- 1. OS & Arsitektur ---');
console.log({
  platform: os.platform(),
  arch: os.arch(),
  release: os.release(),
  uptimeHours: Number((os.uptime() / 3600).toFixed(2)),
});

// 2. CPU & Parallelism
console.log('\n--- 2. CPU & Parallelism ---');
console.log({
  model: os.cpus()[0]?.model,
  cores: os.cpus().length,
  availableParallelism: os.availableParallelism(),
});

// 3. Memori RAM (GB)
console.log('\n--- 3. Memori RAM (GB) ---');
const totalMem = os.totalmem();
const freeMem = os.freemem();
console.log({
  totalGb: Number((totalMem / 1024 ** 3).toFixed(2)),
  freeGb: Number((freeMem / 1024 ** 3).toFixed(2)),
  usedPercent: Number((((totalMem - freeMem) / totalMem) * 100).toFixed(2)),
});

// 4. Beban Sistem (Load Average 1m, 5m, 15m)
console.log('\n--- 4. Load Average ---');
console.log(os.loadavg());

// 5. User & Direktori Sistem
console.log('\n--- 5. User & Direktori ---');
let username = 'unknown';
try {
  username = os.userInfo().username;
} catch {
  // Fallback jika berjalan di container tanpa user database
}

console.log({
  homedir: os.homedir(),
  tmpdir: os.tmpdir(),
  username,
});

// 6. Kartu Jaringan (IPv4 Non-Internal)
console.log('\n--- 6. Kartu Jaringan ---');
const networkList = Object.entries(os.networkInterfaces()).flatMap(
  ([name, interfaces]) =>
    (interfaces || [])
      .filter((item) => item.family === 'IPv4' && !item.internal)
      .map((item) => ({ name, ip: item.address, mac: item.mac })),
);
console.table(networkList);
