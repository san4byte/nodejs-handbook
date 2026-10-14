import dns from 'node:dns/promises';

const data = await dns.resolve4('www.youtube.com');
let hostname = [];
data.forEach((e, host) => {
  hostname.push({ e, host });
});
console.log(hostname);
