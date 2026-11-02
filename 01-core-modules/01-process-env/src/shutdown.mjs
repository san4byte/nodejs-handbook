import process from 'node:process';

let isShuttingDown = false;

function handleShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Received ${signal}. Draining active connections...`);

  setTimeout(() => {
    console.log('All connections drained. Safe exit completed.');
    process.exit(0);
  }, 100);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

console.log('Application started. Simulating shutdown event...');

// Simulate OS signal for demonstration
setTimeout(() => {
  process.emit('SIGTERM');
}, 50);
