import {
  setTimeout,
  setInterval,
  setImmediate,
  scheduler,
} from 'node:timers/promises';

// 1. Penundaan Linier & Pembatalan Timer (setTimeout & AbortController)
console.log('--- 1. Penundaan Linier & Pembatalan Timer ---');
const delayValue = await setTimeout(20, 'completed');

const abortCtrl = new AbortController();
let abortCaught = false;
abortCtrl.abort();

try {
  await setTimeout(100, 'unreachable', { signal: abortCtrl.signal });
} catch (error) {
  if (error.name === 'AbortError') abortCaught = true;
}

console.log({
  delayResult: delayValue,
  timerAborted: abortCaught,
});

// 2. Perulangan Interval Asinkron (setInterval & for await...of)
console.log('\n--- 2. Perulangan Interval Asinkron ---');
const collectedTicks = [];
for await (const tickTime of setInterval(10, 'TICK')) {
  collectedTicks.push(tickTime);
  if (collectedTicks.length === 3) break;
}

console.log({
  totalTicks: collectedTicks.length,
  ticks: collectedTicks,
});

// 3. Penjadwalan Macrotask Cepat (setImmediate)
console.log('\n--- 3. Penjadwalan Macrotask Cepat ---');
const immediateValue = await setImmediate('immediate-pass');

console.log({
  receivedValue: immediateValue,
});

// 4. Timer Klasik Callback & Pembersihan (clearTimeout & clearInterval)
console.log('\n--- 4. Timer Klasik Callback & Pembersihan ---');
let callbackExecuted = false;
const cancelableTimerId = globalThis.setTimeout(() => {
  callbackExecuted = true;
}, 50);

globalThis.clearTimeout(cancelableTimerId);

const repeatingId = globalThis.setInterval(() => {}, 100);
globalThis.clearInterval(repeatingId);

console.log({
  wasExecuted: callbackExecuted,
  clearedSuccessfully: true,
});

// 5. Penyerahan Giliran Eksekusi Kooperatif (scheduler.yield)
console.log('\n--- 5. Penyerahan Giliran Eksekusi Kooperatif ---');
let yieldSteps = 0;
while (yieldSteps < 3) {
  yieldSteps++;
  await scheduler.yield();
}

console.log({
  completedYieldSteps: yieldSteps,
});

// 6. Hirarki Antrean Microtask vs Macrotask
console.log('\n--- 6. Hirarki Antrean Microtask vs Macrotask ---');
const executionLog = [];

await new Promise((resolve) => {
  globalThis.setTimeout(() => {
    executionLog.push('macrotask-timeout');
    resolve();
  }, 0);

  Promise.resolve().then(() => {
    executionLog.push('microtask-promise');
  });

  queueMicrotask(() => {
    executionLog.push('microtask-queue');
  });
});

console.log({
  executionSequence: executionLog,
  microtaskFirst: executionLog[0].startsWith('microtask'),
});

Promise.resolve().then(() => {
  executionLog.push('microtask-promise');
});

queueMicrotask(() => {
  executionLog.push('microtask-queue');
});

console.log({
  executionSequence: executionLog,
  microtaskFirst: executionLog[0].startsWith('microtask'),
});
