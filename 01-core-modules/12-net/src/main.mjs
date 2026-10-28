import net from 'node:net';

// 1. Inisialisasi Server & Pengikatan Port
console.log('--- 1. Inisialisasi Server & Pengikatan Port ---');
const initServer = net.createServer();
await new Promise((resolve) => initServer.listen(0, '127.0.0.1', resolve));
const addressInfo = initServer.address();
await new Promise((resolve) => initServer.close(resolve));

console.log({
  boundAddress: addressInfo.address,
  allocatedPort: addressInfo.port,
  family: addressInfo.family,
});

// 2. Komunikasi Dua Arah Client-Server
console.log('\n--- 2. Komunikasi Dua Arah Client-Server ---');
let clientReceived = '';
let serverReceived = '';

const echoServer = net.createServer((socket) => {
  socket.on('error', () => {});
  socket.on('data', (chunk) => {
    serverReceived = chunk.toString();
    socket.write('PONG');
  });
});
await new Promise((resolve) => echoServer.listen(0, resolve));

await new Promise((resolve) => {
  const client = net.createConnection(
    { port: echoServer.address().port },
    () => {
      client.write('PING');
    },
  );
  client.on('error', () => {});
  client.on('data', (chunk) => {
    clientReceived = chunk.toString();
    client.destroy();
    echoServer.close(resolve);
  });
});

console.log({
  clientSent: 'PING',
  serverReceived,
  clientReceived,
});

// 3. Penutupan Saluran Pengiriman Anggun
console.log('\n--- 3. Penutupan Saluran Pengiriman Anggun ---');
let finReceived = false;

const endServer = net.createServer((socket) => {
  socket.on('error', () => {});
  socket.on('data', () => {});
  socket.on('end', () => {
    finReceived = true;
    socket.end();
  });
});
await new Promise((resolve) => endServer.listen(0, resolve));

await new Promise((resolve) => {
  const client = net.createConnection(
    { port: endServer.address().port },
    () => {
      client.end('FINAL_DATA');
    },
  );
  client.on('error', () => {});
  client.on('close', () => {
    endServer.close(resolve);
  });
});

console.log({
  finSignalDetected: finReceived,
  halfClosedSuccessfully: true,
});

// 4. Deteksi Batas Waktu Hening & Pemutusan
console.log('\n--- 4. Deteksi Batas Waktu Hening & Pemutusan ---');
let timeoutTriggered = false;

const timeoutServer = net.createServer((socket) => {
  socket.on('error', () => {});
  socket.setTimeout(30);
  socket.on('timeout', () => {
    timeoutTriggered = true;
    socket.destroy();
  });
});
await new Promise((resolve) => timeoutServer.listen(0, resolve));

await new Promise((resolve) => {
  const client = net.createConnection({ port: timeoutServer.address().port });
  client.on('error', () => {});
  client.on('close', () => {
    timeoutServer.close(resolve);
  });
});

console.log({
  timeoutDetected: timeoutTriggered,
  socketDestroyed: true,
});

// 5. Penanganan Error Jaringan & Status Server
console.log('\n--- 5. Penanganan Error Jaringan & Status Server ---');
let capturedErrorCode = '';

await new Promise((resolve) => {
  const invalidClient = net.createConnection({ port: 1 });
  invalidClient.on('error', (err) => {
    capturedErrorCode = err.code;
    resolve();
  });
});

const lifecycleServer = net.createServer();
await new Promise((resolve) => lifecycleServer.listen(0, resolve));
const isListeningBefore = lifecycleServer.listening;
await new Promise((resolve) => lifecycleServer.close(resolve));
const isListeningAfter = lifecycleServer.listening;

console.log({
  refusedErrorCode: capturedErrorCode,
  listeningBeforeClose: isListeningBefore,
  listeningAfterClose: isListeningAfter,
});
