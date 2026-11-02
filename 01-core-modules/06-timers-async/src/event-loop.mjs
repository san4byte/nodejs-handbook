import process from 'node:process';

console.log('1. Synchronous START');

setTimeout(() => {
  console.log('4. setTimeout (Macrotask)');
}, 0);

setImmediate(() => {
  console.log('5. setImmediate (Check phase)');
});

queueMicrotask(() => {
  console.log('3. queueMicrotask (Microtask)');
});

process.nextTick(() => {
  console.log('2. process.nextTick (High priority microtask)');
});

console.log('1. Synchronous END');
