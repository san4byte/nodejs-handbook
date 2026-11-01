// SOAL 1
function getUtf8ByteLength(text) {
  const encoder = new TextEncoder();
  const encodedText = encoder.encode(text);

  return encodedText.byteLength;
}

console.log(getUtf8ByteLength('Hello Node.js')); // 13

// SOAL 2
function cloneAndMeasure(targetObject) {
  const startTime = performance.now();
  const clonedObject = structuredClone(targetObject);
  const endTime = performance.now();

  clonedObject.clonedAt = new Date();
  clonedObject.durationMs = Number((endTime - startTime).toFixed(3));

  return clonedObject;
}

console.log(cloneAndMeasure({ module: 'Globals', version: 1 }));

// SOAL 3
function scheduleMicroBatch(payloads, byteLimit, signal) {
  return new Promise((resolve) => {
    queueMicrotask(() => {
      const encoder = new TextEncoder();
      const binaries = [];
      let totalBytes = 0;

      for (const payload of payloads) {
        if (signal?.aborted) {
          return resolve({ success: false, reason: signal.reason });
        }

        const encoded = encoder.encode(payload);
        totalBytes += encoded.byteLength;

        if (totalBytes > byteLimit) {
          return resolve({ success: false, reason: 'Byte quota exceeded' });
        }

        binaries.push(encoded);
      }

      return resolve({
        success: true,
        totalBytes,
        binaries,
      });
    });
  });
}

const controller = new AbortController();
console.log(await scheduleMicroBatch(['alpha', 'beta'], 50, controller.signal));
console.log(
  await scheduleMicroBatch(
    ['very long payload exceeding byte quota limit'],
    10,
    controller.signal,
  ),
);
controller.abort('Cancelled by user');
console.log(await scheduleMicroBatch(['data'], 100, controller.signal));
