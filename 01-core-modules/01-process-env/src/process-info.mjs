// run: node src/process-info.mjs
import process from 'node:process';

console.log('PID:', process.pid);
// Output: PID: <number>
console.log('Platform:', process.platform);
// Output: Platform: linux
console.log('Node.js Version:', process.version);
// Output: Node.js Version: v24.15.0

const memory = process.memoryUsage();
console.log('RSS (MB):', (memory.rss / 1024 / 1024).toFixed(2));
// Output: RSS (MB): 46.30
console.log('Heap Used (MB):', (memory.heapUsed / 1024 / 1024).toFixed(2));
// Output: Heap Used (MB): 4.70

console.log('Uptime (s):', process.uptime().toFixed(2));
// Output: Uptime (s): 0.18

const start = process.hrtime.bigint();
for (let i = 0; i < 1_000_000; i++) Math.sqrt(i);
const duration = Number(process.hrtime.bigint() - start) / 1_000_000;
console.log('Execution duration (ms):', duration.toFixed(2));
// Output: Execution duration (ms): 50.25
