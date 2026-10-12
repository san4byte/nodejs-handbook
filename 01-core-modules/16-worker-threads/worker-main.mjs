import { Worker, threadId } from 'node:worker_threads';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workerPath = path.join(__dirname, 'worker.mjs');

// Menginisialisasi dua thread terpisah
const worker1 = new Worker(workerPath);
const worker2 = new Worker(workerPath);

// Menerima pesan dari worker thread 1
worker1.addListener('message', (message) => {
  console.info(`MainThread-${threadId} menerima dari Worker 1: ${message}`);
});

// Menerima pesan dari worker thread 2
worker2.addListener('message', (message) => {
  console.info(`MainThread-${threadId} menerima dari Worker 2: ${message}`);
});

// Mengirim pesan input ke masing-masing worker
worker1.postMessage(3);
worker2.postMessage(3);
