import http from 'node:http';

export function createDemoServer(port = 0) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
        return;
      }

      if (req.method === 'POST' && req.url === '/echo') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ echoed: body }));
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    });

    server.listen(port, () => {
      resolve(server);
    });
  });
}

// Standalone execution test
if (process.argv[1] && process.argv[1].endsWith('server.mjs')) {
  const server = await createDemoServer(0);
  const { port } = server.address();
  console.log(`Server listening on port ${port}`);
  server.close();
}
