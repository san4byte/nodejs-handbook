import process from 'node:process';

class GracefulServer {
  constructor(option = {}) {
    if (!option.serviceName || typeof option.serviceName !== 'string') {
      throw new Error('serviceName is required and must be a string');
    }

    this.isShuttingDown = false;
    this.serviceName = option.serviceName;
    this.drainDelayMs = option.drainDelayMs ?? 200;
  }

  start() {
    process.on('SIGTERM', () => this.stop('SIGTERM'));
    process.on('SIGINT', () => this.stop('SIGINT'));
    console.log(`[${this.serviceName}] Started on PID: ${process.pid}`);
    return this;
  }

  stop(signal) {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log(
      `[${this.serviceName}] Received ${signal}. Draining active connections...`,
    );

    setTimeout(() => {
      console.log(
        `[${this.serviceName}] All connections drained. Safe exit completed.`,
      );
      process.exit(0);
    }, this.drainDelayMs);
  }

  simulateSignal(signal) {
    process.emit(signal);
  }
}

console.log('=== TEST SOAL 3: GracefulServer ===');

// Test 0: Validasi constructor option
try {
  new GracefulServer();
} catch (err) {
  console.log('Test 0 (Missing Option Caught):', err.message);
  // Expected: serviceName is required and must be a string
}

const server = new GracefulServer({
  serviceName: 'OrderService',
  drainDelayMs: 150,
});

// 1. Jalankan server
server.start();

// 2. Simulasikan sinyal pertama
server.simulateSignal('SIGTERM');

// 3. Simulasikan sinyal ganda segera setelahnya (harus diabaikan)
server.simulateSignal('SIGINT');

// Expected Output:
// === TEST SOAL 3: GracefulServer ===
// [OrderService] Started on PID: <nomor_pid>
// [OrderService] Received SIGTERM. Draining active connections...
// (Tunggu 150ms)
// [OrderService] All connections drained. Safe exit completed.
