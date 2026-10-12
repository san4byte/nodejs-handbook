import { parentPort, threadId } from 'node:worker_threads';

// kirim ke worker-main.mjs
parentPort.addListener('message', (message) => {
  for (let index = 0; index < message; index++) {
    console.info(`Thred-${threadId} send message ${index}`);
    parentPort.postMessage(index);
  }
  parentPort.close();
});
