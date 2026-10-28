import net from 'node:net';

// SOAL 1
function checkActivePort(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const client = net.createConnection({ port, host });
    let isSettled = false;

    const finish = (result) => {
      if (isSettled) return;
      isSettled = true;
      client.destroy();
      resolve(result);
    };

    client.setTimeout(timeoutMs);
    client.on('connect', () => finish(true));
    client.on('error', () => finish(false));
    client.on('timeout', () => finish(false));
  });
}

console.log('--- Soal 1: checkActivePort ---');
const server1 = net.createServer().listen(0);
const { port: port1 } = server1.address();

const isOpen1 = await checkActivePort('127.0.0.1', port1, 200);
const isClosed1 = await checkActivePort('127.0.0.1', 1, 200);

console.log({
  openPortResult: isOpen1,
  closedPortResult: isClosed1,
});

server1.close();

// SOAL 2
function parseMessageFrames(initialBuffer, chunk, delimiter) {
  const combined = initialBuffer + chunk;
  const messages = combined.split(delimiter);

  const completeMessages = messages.slice(0, -1).filter(Boolean);
  const remainingBuffer = messages.at(-1);

  return {
    completeMessages,
    remainingBuffer,
  };
}

console.log('\n--- Soal 2: parseMessageFrames ---');
const frameResult1 = parseMessageFrames(
  'initial_part',
  '_continuation\nsecond_msg\npending_third',
  '\n',
);
console.log(frameResult1);

const frameResult2 = parseMessageFrames('', 'first\n\nsecond\n', '\n');
console.log(frameResult2);

// SOAL 3
function createTcpCommandServer() {
  const store = new Map();

  const server = net.createServer((socket) => {
    let buffer = '';

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf-8');
      const lines = buffer.split('\n');
      buffer = lines.pop();

      if (buffer.length > 256) {
        socket.write('ERR:PAYLOAD_TOO_LARGE\n');
        socket.destroy();
        return;
      }

      for (const line of lines) {
        if (!line.trim()) continue;

        if (line.startsWith('SET:')) {
          const payload = line.slice(4);
          const eqIndex = payload.indexOf('=');
          if (eqIndex <= 0) {
            socket.write('ERR:INVALID_COMMAND\n');
          } else {
            const key = payload.slice(0, eqIndex);
            const value = payload.slice(eqIndex + 1);
            store.set(key, value);
            socket.write('OK:STORED\n');
          }
        } else if (line.startsWith('GET:')) {
          const key = line.slice(4);
          if (store.has(key)) {
            const value = store.get(key);
            socket.write(`VAL:${value}\n`);
          } else {
            socket.write('ERR:NOT_FOUND\n');
          }
        } else if (line === 'COUNT') {
          socket.write(`VAL:${store.size}\n`);
        } else if (line === 'QUIT') {
          socket.end();
          break;
        } else {
          socket.write('ERR:INVALID_COMMAND\n');
        }
      }
    });

    socket.on('error', () => {
      socket.destroy();
    });

    socket.on('close', () => {
      buffer = '';
    });
  });

  return server;
}

console.log('\n--- Soal 3: createTcpCommandServer ---');
const server3 = createTcpCommandServer();
await new Promise((resolve) => server3.listen(0, resolve));
const { port: port3 } = server3.address();

await new Promise((resolve) => {
  const client3 = net.createConnection({ port: port3 }, () => {
    client3.write('SET:language=javascript\nGET:language\nCOUNT\nQUIT\n');
  });

  client3.on('data', (chunk) => {
    process.stdout.write(chunk.toString());
  });

  client3.on('close', () => {
    server3.close(resolve);
  });
});
