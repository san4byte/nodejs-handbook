import net from 'net';

const connection = net.createConnection({ port: 8000, host: 'localhost' });

setInterval(() => {
  connection.write(`${process.argv[2]}\r\n`);
}, 1000);

connection.addListener('data', (data) => {
  console.info(`data from server: ${data.toString()}`);
});
