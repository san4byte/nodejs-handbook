import { setInterval } from 'node:timers/promises';

const interval = 1000;
for await (const startTime of setInterval(interval, Date.now())) {
  const now = Date.now();
  console.log(now);
  if (now - startTime > 5000) break;
}
console.log(Date.now());
