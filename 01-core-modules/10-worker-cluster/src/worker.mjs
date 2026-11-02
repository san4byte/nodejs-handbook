import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

if (isMainThread) {
  // Main thread: spawns worker
  const worker = new Worker(new URL(import.meta.url), {
    workerData: { num: 40 },
  });

  worker.on('message', (result) => {
    console.log('Result received from worker:', result);
  });

  worker.on('exit', (code) => {
    console.log('Worker exited with code:', code);
  });
} else {
  // Worker thread: computes heavy calculation
  function fibonacci(n) {
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      const c = a + b;
      a = b;
      b = c;
    }
    return b;
  }

  const result = fibonacci(workerData.num);
  parentPort.postMessage({ input: workerData.num, fib: result });
}
