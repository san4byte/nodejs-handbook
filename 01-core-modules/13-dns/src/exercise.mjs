import dns from 'node:dns/promises';

// SOAL 1
async function resolveLocalIp(hostname) {
  try {
    const result = await dns.lookup(hostname);
    return {
      ip: result.address,
      family: result.family,
    };
  } catch {
    return null;
  }
}

console.log('--- Soal 1: resolveLocalIp ---');
const localIpSuccess = await resolveLocalIp('localhost');
const localIpFail = await resolveLocalIp('hostname-tidak-ditemukan.local');
console.log({
  localIpSuccess,
  localIpFail,
});

// SOAL 2
function extractSpfRecord(txtRecords) {
  for (const record of txtRecords) {
    const fullText = record.join('');
    if (fullText.startsWith('v=spf1')) {
      const parts = fullText.split(' ');
      const versionPart = parts.shift();
      const qualifier = parts.pop();

      return {
        version: versionPart.replace('v=', ''),
        rules: parts,
        qualifier,
      };
    }
  }
  return null;
}

console.log('\n--- Soal 2: extractSpfRecord ---');
const spfRecordFound = extractSpfRecord([
  ['v=spf1 include:_spf.example.com ip4:192.0.2.0/24 -all'],
  ['google-site-verification=token123'],
]);
console.log(spfRecordFound);

const spfRecordNotFound = extractSpfRecord([
  ['google-site-verification=token123'],
]);
console.log(spfRecordNotFound);

// SOAL 3
async function diagnoseDomain(domainName, customResolver) {
  if (typeof domainName !== 'string' || domainName.trim() === '') {
    return {
      success: false,
      reason: 'INVALID_DOMAIN_NAME',
    };
  }

  let ipv4 = [];
  let hasRedundancy = false;
  try {
    ipv4 = await customResolver.resolve4(domainName);
    hasRedundancy = ipv4.length > 1;
  } catch {
    ipv4 = [];
    hasRedundancy = false;
  }

  let mxList = [];
  try {
    mxList = await customResolver.resolveMx(domainName);
    mxList.sort((a, b) => a.priority - b.priority);
  } catch {
    mxList = [];
  }

  let totalNs = 0;
  try {
    const nsList = await customResolver.resolveNs(domainName);
    totalNs = nsList.length;
  } catch {
    totalNs = 0;
  }

  return {
    success: true,
    domain: domainName,
    ipv4,
    hasRedundancy,
    sortedMx: mxList,
    totalNs,
  };
}

const mockResolver = {
  resolve4: async () => ['93.184.216.34', '93.184.216.35'],
  resolveMx: async () => [
    { exchange: 'backup.mail.com', priority: 20 },
    { exchange: 'primary.mail.com', priority: 10 },
  ],
  resolveNs: async () => ['ns1.example.com', 'ns2.example.com'],
};

console.log('\n--- Soal 3: diagnoseDomain ---');
const diagnosisMock = await diagnoseDomain('example.com', mockResolver);
console.log(diagnosisMock);

const diagnosisInvalid = await diagnoseDomain('', mockResolver);
console.log(diagnosisInvalid);

const diagnosisLive = await diagnoseDomain('nodejs.org', dns);
console.log(diagnosisLive);
