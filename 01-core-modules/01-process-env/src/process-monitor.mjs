// run: node src/process-monitor.mjs
import process from 'node:process';

function monitorMemory() {
  const memory = process.memoryUsage();
  console.log('RSS (MB):', (memory.rss / 1024 / 1024).toFixed(2));
  console.log('Heap Used (MB):', (memory.heapUsed / 1024 / 1024).toFixed(2));
  console.log('Uptime (s):', process.uptime().toFixed(2));
}

const monitor = setInterval(monitorMemory, 1000);

process.on('SIGINT', () => {
  console.log('SIGINT received. Stopping monitor...');
  // Output: SIGINT received. Stopping monitor...
  clearInterval(monitor);
  process.exitCode = 0;
});

process.on('uncaughtException', (err) => {
  console.error('Fatal crash, shutting down:', err.message);
  clearInterval(monitor);
  process.exitCode = 1;
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason.message);
  clearInterval(monitor);
  process.exitCode = 1;
});

console.log('Monitor started. Press Ctrl+C to stop.');
// Output: Monitor started. Press Ctrl+C to stop.
