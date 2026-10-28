import dns from 'node:dns/promises';

// 1. Resolusi Host Sistem Operasi (dns.lookup)
console.log('--- 1. Resolusi Host Sistem Operasi ---');
const lookupSingle = await dns.lookup('localhost');
const lookupAll = await dns.lookup('localhost', { all: true });
console.log({
  singleAddress: lookupSingle.address,
  ipFamily: lookupSingle.family,
  allAddresses: lookupAll,
});

// 2. Resolusi Record IPv4 (dns.resolve4)
console.log('\n--- 2. Resolusi Record IPv4 ---');
let ipv4Addresses = [];
try {
  ipv4Addresses = await dns.resolve4('nodejs.org');
} catch {
  ipv4Addresses = [];
}
console.log({
  domain: 'nodejs.org',
  records: ipv4Addresses,
  primaryIp: ipv4Addresses[0],
});

// 3. Resolusi Record Mail Exchange & Teks (dns.resolveMx & dns.resolveTxt)
console.log('\n--- 3. Resolusi Record Mail Exchange & Teks ---');
let mxRecords = [];
try {
  mxRecords = await dns.resolveMx('nodejs.org');
} catch {
  mxRecords = [];
}

let txtRecords = [];
try {
  txtRecords = await dns.resolveTxt('nodejs.org');
} catch {
  txtRecords = [];
}
console.log({
  primaryMx: mxRecords[0],
  rawTxtChunk: txtRecords[0],
  joinedTxt: txtRecords[0].join(''),
});

// 4. Resolusi Name Server & Reverse DNS (dns.resolveNs & dns.reverse)
console.log('\n--- 4. Resolusi Name Server & Reverse DNS ---');
let nsRecords = [];
try {
  nsRecords = await dns.resolveNs('nodejs.org');
} catch {
  nsRecords = [];
}

let hostnames = [];
try {
  hostnames = await dns.reverse('8.8.8.8');
} catch {
  hostnames = [];
}
console.log({
  nameServers: nsRecords,
  reverseHostnames: hostnames,
});

// 5. Konfigurasi Server Resolver Kustom (dns.setServers & dns.getServers)
console.log('\n--- 5. Konfigurasi Server Resolver Kustom ---');
const initialServers = dns.getServers();
dns.setServers(['1.1.1.1', '8.8.8.8']);
const updatedServers = dns.getServers();
console.log({
  initialServers,
  updatedServers,
});

// 6. Penanganan Kondisi Khusus & Error Sistem
console.log('\n--- 6. Penanganan Kondisi Khusus & Error Sistem ---');
let invalidIpError = null;
try {
  await dns.reverse('invalid-ip-format');
} catch (error) {
  invalidIpError = error.code;
}

let invalidServerError = null;
try {
  dns.setServers(['999.999.999.999']);
} catch (error) {
  invalidServerError = error.code;
}
console.log({
  invalidIpError,
  invalidServerError,
});
