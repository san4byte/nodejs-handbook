/**
 * 03 - OS Demonstration (Industry Standard)
 *
 * Demonstrasi inspeksi sistem operasi dan hardware untuk DevOps & SRE:
 * 1. Platform, Arsitektur & Kernel Release
 * 2. CPU Cores & Modern Concurrency (availableParallelism)
 * 3. RAM Memory Telemetry (Total, Free, Used, Percentage)
 * 4. System Load Average (Linux 1, 5, 15 min load)
 * 5. Network Interface Discovery (IP Address & MAC)
 * 6. User Context & Safe Temporary Directories
 */

import os from 'node:os';

console.log('=== 1. OS Platform & Hardware Architecture ===');
console.log('Platform OS       :', os.platform());
console.log('Arsitektur CPU    :', os.arch());
console.log('Versi Kernel      :', os.release());
console.log('Nama Host Mesin   :', os.hostname());

console.log('\n=== 2. CPU Topology & Concurrency Sizing ===');
const cpus = os.cpus();
console.log(`Terdeteksi ${cpus.length} inti CPU fisik/logical.`);
console.log('Model Prosesor    :', cpus[0]?.model || 'Unknown');

// Node.js v19.4.0+: os.availableParallelism() membaca batas quota cgroup di container!
const availableCores =
  typeof os.availableParallelism === 'function'
    ? os.availableParallelism()
    : cpus.length;
console.log(
  'Available Cores   :',
  availableCores,
  '(Container-aware parallelism quota)',
);

console.log('\n=== 3. Memory Telemetry & Utilization ===');
const totalBytes = os.totalmem();
const freeBytes = os.freemem();
const usedBytes = totalBytes - freeBytes;

const toGB = (bytes) => (bytes / 1024 ** 3).toFixed(2);
const usedPercent = ((usedBytes / totalBytes) * 100).toFixed(2);

console.log(`Total RAM Fisik   : ${toGB(totalBytes)} GB`);
console.log(`RAM Bebas (Free)  : ${toGB(freeBytes)} GB`);
console.log(`RAM Terpakai      : ${toGB(usedBytes)} GB (${usedPercent}%)`);

console.log('\n=== 4. System Load Average (Linux / Unix) ===');
// Mengembalikan array [1 min, 5 min, 15 min] load average
const load = os.loadavg();
console.log(
  'Load Average      :',
  `1m: ${load[0].toFixed(2)}, 5m: ${load[1].toFixed(2)}, 15m: ${load[2].toFixed(2)}`,
);

console.log('\n=== 5. Network Interfaces Discovery ===');
const nets = os.networkInterfaces();
const localIps = [];

for (const [interfaceName, netList] of Object.entries(nets)) {
  for (const net of netList || []) {
    // Ambil alamat IPv4 yang bukan loopback (127.0.0.1)
    if (net.family === 'IPv4' && !net.internal) {
      localIps.push({
        Interface: interfaceName,
        IP: net.address,
        MAC: net.mac,
      });
    }
  }
}
console.table(
  localIps.length > 0
    ? localIps
    : [{ Interface: 'Loopback', IP: '127.0.0.1', MAC: 'N/A' }],
);

console.log('\n=== 6. User Environment & Safe Paths ===');
console.log('Home Directory    :', os.homedir());
console.log('Temp Directory    :', os.tmpdir());
try {
  const userInfo = os.userInfo();
  console.log('User Aktif        :', userInfo.username);
} catch (e) {
  // Dalam container minimal tertentu userInfo bisa dibatasi
  console.log('User Aktif        : Container restricted');
}

console.log('\n=== 7. System Uptime ===');
const uptimeHours = (os.uptime() / 3600).toFixed(2);
console.log(`Sistem aktif selama: ${uptimeHours} jam`);
