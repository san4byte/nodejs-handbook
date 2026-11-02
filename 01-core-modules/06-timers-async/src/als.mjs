import { AsyncLocalStorage } from 'node:async_hooks';

const als = new AsyncLocalStorage();

function log(message) {
  const store = als.getStore();
  const id = store ? store.get('reqId') : 'ANONYMOUS';
  console.log(`[${id}] ${message}`);
}

async function queryDatabase() {
  log('Query finished.');
}

async function handle(reqId) {
  const map = new Map([['reqId', reqId]]);
  await als.run(map, async () => {
    log('Incoming request');
    await queryDatabase();
  });
}

await Promise.all([handle('req-101'), handle('req-102')]);
