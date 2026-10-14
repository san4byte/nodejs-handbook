globalThis.appRegion = 'ID-id';
console.log(global.appRegion); // ID-id

const localIdentifier = 'secret';
console.log(globalThis.localIdentifier); // undefined

// structuredClone()
const originalProfile = {
  name: 'Sarah',
  settings: { theme: 'dark', notifications: true },
};

const clonedProfile = structuredClone(originalProfile);
clonedProfile.settings.theme = 'light';

console.log(originalProfile.settings.theme);
// Output: dark
console.log(clonedProfile.settings.theme);
// Output: light

try {
  structuredClone({ calculate: () => 42 });
} catch (error) {
  console.log(error.name);
  // Output: DataCloneError
}

// performance.now()
const startTime = performance.now();

let total = 0;
for (let i = 0; i < 100_000; i++) {
  total += i;
}

const endTime = performance.now();
const duration = endTime - startTime;

console.log(typeof duration); // number
console.log(duration >= 0); // true

// TextEncoder & TextDecoder
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const encodedBytes = encoder.encode('Node.js');
const decodedBytes = decoder.decode(encodedBytes);

console.log(encodedBytes instanceof Uint8Array); // true
console.log(encodedBytes); // [78, 111, 100, 101,  46, 106, 115]
console.log(encodedBytes.length); // 7
console.log(decodedBytes); // Node.js

// queueMicrotask()
const executionOrder = [];

setTimeout(() => {
  executionOrder.push('03 timer-macrotask');
}, 0);

queueMicrotask(() => {
  executionOrder.push('02 microtask');
});

executionOrder.push('01 sync');

setTimeout(() => {
  console.log(executionOrder.join(' -> '));
  // Output: sync -> microtask -> timer-macrotask
}, 10);

const binaries = [
  [97, 108, 112, 104, 97],
  [98, 101, 116, 97],
];

console.log(binaries.reduce((t, e) => t + e.length, 0));
