import { setInterval, setTimeout } from 'node:timers/promises';

// 1. Soal 1 (Dasar)
async function countdown(startSeconds) {
  for await (const _ of setInterval(20)) {
    console.log(startSeconds);
    if (startSeconds === 0) {
      break;
    }
    startSeconds--;
  }
  return 'Time expired!';
}

console.log('--- Soal 1 ---');
const countdownMessage = await countdown(3);
console.log(countdownMessage);

// 2. Soal 2 (Menengah)
async function delayedAction(actionFn, delayMs, signal) {
  try {
    await setTimeout(delayMs, undefined, { signal });
    return actionFn();
  } catch (error) {
    if (error.name === 'AbortError') {
      return 'Action cancelled';
    }
    throw error;
  }
}

console.log('\n--- Soal 2 ---');
// Kasus 1: Berhasil dieksekusi tanpa pembatalan
const completedTaskResult = await delayedAction(() => 'Task completed', 20);
console.log(completedTaskResult);

// Kasus 2: Dibatalkan sebelum jeda waktu selesai
const actionCancelController = new AbortController();
const cancelledActionPromise = delayedAction(
  () => 'Never runs',
  50,
  actionCancelController.signal,
);
actionCancelController.abort();

const cancelledTaskResult = await cancelledActionPromise;
console.log(cancelledTaskResult);

// 3. Soal 3 (Menantang)
class IntervalWorker {
  constructor(taskFn, intervalMs, maxRuns) {
    this.history = [];
    this.taskFn = taskFn;
    this.intervalMs = intervalMs;
    this.maxRuns = maxRuns;
    this.abort = new AbortController();
  }

  async start() {
    try {
      for await (const _ of setInterval(this.intervalMs, undefined, {
        signal: this.abort.signal,
      })) {
        try {
          const value = await this.taskFn();
          this.history.push({ status: 'success', value });
        } catch (err) {
          this.history.push({ status: 'failure', error: err.message });
        }

        if (this.history.length >= this.maxRuns) {
          this.stop();
          break;
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        throw err;
      }
    }
    return this.history;
  }

  stop() {
    this.abort.abort();
  }

  getHistory() {
    return [...this.history];
  }
}

console.log('\n--- Soal 3 (Kasus 1: Eksekusi Tuntas) ---');
let taskCounter1 = 0;
const fullWorker = new IntervalWorker(
  async () => {
    taskCounter1++;
    if (taskCounter1 === 2) throw new Error('Temporary failure');
    return `Success run ${taskCounter1}`;
  },
  20,
  3,
);

const fullWorkerResult = await fullWorker.start();
console.log('Result:', fullWorkerResult);
console.log('History:', fullWorker.getHistory());

console.log('\n--- Soal 3 (Kasus 2: Berhenti Manual) ---');
let taskCounter2 = 0;
let manualStopWorker;

manualStopWorker = new IntervalWorker(
  async () => {
    taskCounter2++;
    if (taskCounter2 === 2) {
      manualStopWorker.stop();
    }
    return `Task ${taskCounter2}`;
  },
  20,
  5,
);

const manualStopResult = await manualStopWorker.start();
console.log('Result:', manualStopResult);
