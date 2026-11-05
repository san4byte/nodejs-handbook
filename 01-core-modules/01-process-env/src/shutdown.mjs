// run: node src/shutdown.mjs
import http from 'node:http';
import process from 'node:process';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server ready');
});

async function closeDatabase() {
  // Simulate draining active database connection pools
  return new Promise((resolve) => setTimeout(resolve, 50));
}

let isShuttingDown = false;

function setupGracefulShutdown(server) {
  async function shutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`Received ${signal}. Starting graceful shutdown...`);

    // Force exit timer if cleanup hangs beyond orchestrator grace period
    const forceExitTimer = setTimeout(() => {
      console.error('Shutdown timed out. Forcing process termination.');
      process.exit(1);
    }, 5000);
    forceExitTimer.unref();

    // 1. Stop receiving new connections; wait for ongoing requests to finish
    server.close(async () => {
      console.log('HTTP server closed. No longer accepting connections.');

      try {
        // 2. Cleanly close database and external resources
        await closeDatabase();
        console.log('Database connections closed cleanly.');
        // Allow event loop to exit naturally with status 0
        process.exitCode = 0;
      } catch (err) {
        console.error('Error during resource cleanup:', err.message);
        process.exitCode = 1;
      }
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

setupGracefulShutdown(server);

server.listen(0, () => {
  console.log('Server is listening.');
  // Trigger termination signal programmatically for demonstration
  process.emit('SIGTERM');
});
