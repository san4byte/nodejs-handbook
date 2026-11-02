import http from 'node:http';

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ echoed: 'Hello from client!' }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});

server.listen(0, async () => {
  const { port } = server.address();
  const res = await fetch(`http://localhost:${port}/health`);
  const body = await res.text();
  console.log('GET /health status:', res.status, 'body:', body);

  const postRes = await fetch(`http://localhost:${port}/echo`, {
    method: 'POST',
  });
  const postData = await postRes.json();
  console.log('POST /echo status:', postRes.status, 'echoed:', postData.echoed);
  server.close();
});
