import http from 'node:http';

// 1. Inisialisasi Server & Status Siklus Hidup (createServer, listen, close)
console.log('--- 1. Inisialisasi Server & Status Siklus Hidup ---');
const lifecycleServer = http.createServer((req, res) => res.end());
await new Promise((resolve) => lifecycleServer.listen(0, '127.0.0.1', resolve));
const { address: boundAddress, port: boundPort } = lifecycleServer.address();
const activeStatus = lifecycleServer.listening;
await new Promise((resolve) => lifecycleServer.close(resolve));
const closedStatus = lifecycleServer.listening;

console.log({
  boundAddress,
  boundPort,
  activeStatus,
  closedStatus,
});

// 2. Pemrosesan Rute & Parameter URL (req.method, req.url, WHATWG URL)
console.log('\n--- 2. Pemrosesan Rute & Parameter URL ---');
const routerServer = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const roleParam = requestUrl.searchParams.get('role');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ path: requestUrl.pathname, role: roleParam }));
});
await new Promise((resolve) => routerServer.listen(0, '127.0.0.1', resolve));
const routerPort = routerServer.address().port;

const routeResponse = await fetch(`http://127.0.0.1:${routerPort}/users?role=admin`);
const routeData = await routeResponse.json();
await new Promise((resolve) => routerServer.close(resolve));

console.log({
  statusCode: routeResponse.status,
  parsedPath: routeData.path,
  receivedRole: routeData.role,
});

// 3. Header Respons Kustom & Status Code (res.writeHead & res.end)
console.log('\n--- 3. Header Respons Kustom & Status Code ---');
const headerServer = http.createServer((req, res) => {
  res.writeHead(201, {
    'Content-Type': 'application/json',
    'x-powered-by': 'NodeJS-Handbook',
  });
  res.end(JSON.stringify({ created: true }));
});
await new Promise((resolve) => headerServer.listen(0, '127.0.0.1', resolve));
const headerPort = headerServer.address().port;

const headerResponse = await fetch(`http://127.0.0.1:${headerPort}`);
const customHeader = headerResponse.headers.get('x-powered-by');
const headerPayload = await headerResponse.json();
await new Promise((resolve) => headerServer.close(resolve));

console.log({
  httpStatus: headerResponse.status,
  customHeaderValue: customHeader,
  responseBody: headerPayload,
});

// 4. Pengolahan Body Stream Permintaan POST (req stream chunks & JSON)
console.log('\n--- 4. Pengolahan Body Stream Permintaan POST ---');
const bodyServer = http.createServer((req, res) => {
  const bodyChunks = [];
  req.on('data', (chunk) => bodyChunks.push(chunk));
  req.on('end', () => {
    const rawPayload = Buffer.concat(bodyChunks).toString();
    const parsedJson = JSON.parse(rawPayload);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ echo: parsedJson.item, size: rawPayload.length }));
  });
});
await new Promise((resolve) => bodyServer.listen(0, '127.0.0.1', resolve));
const bodyPort = bodyServer.address().port;

const bodyResponse = await fetch(`http://127.0.0.1:${bodyPort}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ item: 'Keyboard' }),
});
const bodyData = await bodyResponse.json();
await new Promise((resolve) => bodyServer.close(resolve));

console.log({
  sentItem: 'Keyboard',
  echoResult: bodyData.echo,
  payloadBytes: bodyData.size,
});

// 5. Pembatalan Permintaan Client via Timeout (fetch & AbortSignal.timeout)
console.log('\n--- 5. Pembatalan Permintaan Client via Timeout ---');
let timeoutErrorName = '';
const hangingServer = http.createServer(() => {});
await new Promise((resolve) => hangingServer.listen(0, '127.0.0.1', resolve));
const hangingPort = hangingServer.address().port;

try {
  await fetch(`http://127.0.0.1:${hangingPort}`, {
    signal: AbortSignal.timeout(50),
  });
} catch (error) {
  timeoutErrorName = error.name;
}
await new Promise((resolve) => hangingServer.close(resolve));

console.log({
  abortSignalTriggered: timeoutErrorName === 'TimeoutError',
  capturedErrorName: timeoutErrorName,
});
