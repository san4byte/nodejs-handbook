import net from 'net';

const server = net.createServer((c) => {
  console.info('Client connected');

  c.on('data', (data) => {
    console.log(`Data: ${data.toString()}`);
    c.write(`Hello ${data.toString()}\r\n`);
  });
});

server.listen(8000, 'localhost');
