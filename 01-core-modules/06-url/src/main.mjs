import { fileURLToPath, pathToFileURL } from 'node:url';

// 1. Inisialisasi & Resolusi URL
console.log('--- 1. Inisialisasi & Resolusi URL ---');
let invalidUrlCode = null;
try {
  new URL('path-without-base');
} catch (error) {
  invalidUrlCode = error.code;
}

const resolvedUrl = new URL('/v1/users', 'https://api.example.com');
const safeEndpoint = new URL('charges?q=query', 'https://api.stripe.com/v1/');

console.log({
  resolvedWithBase: resolvedUrl.href,
  endpointResolved: safeEndpoint.href,
  invalidUrlError: invalidUrlCode,
});

// 2. Anatomi Komponen URL
console.log('\n--- 2. Anatomi Komponen URL ---');
const sampleUrl = new URL(
  'https://example.com:8080/catalog?page=1&sort=latest#inventory',
);

console.log({
  origin: sampleUrl.origin,
  protocol: sampleUrl.protocol,
  host: sampleUrl.host,
  hostname: sampleUrl.hostname,
  port: sampleUrl.port,
  pathname: sampleUrl.pathname,
  search: sampleUrl.search,
  hash: sampleUrl.hash,
});

// 3. Pembacaan Kueri (get & getAll)
console.log('\n--- 3. Pembacaan Kueri (get & getAll) ---');
const queryUrl = new URL(
  'https://shop.example.com/items?category=electronics&color=red&color=blue&color=green&page=1',
);
const params = queryUrl.searchParams;

console.log({
  singleParam: params.get('category'),
  firstOfMultiple: params.get('color'),
  allColors: params.getAll('color'),
  missingParam: params.get('nonExistent'),
});

// 4. Modifikasi Kueri (set vs append)
console.log('\n--- 4. Modifikasi Kueri (set vs append) ---');
const searchParams = new URLSearchParams('tag=js&tag=node');
searchParams.set('tag', 'express');
searchParams.append('tag', 'go');

console.log({
  tagsAfterSetAndAppend: searchParams.getAll('tag'),
  serializedQuery: searchParams.toString(),
});

// 5. Konversi URL Berkas Lokal (fileURLToPath & pathToFileURL)
console.log('\n--- 5. Konversi URL Berkas Lokal ---');
let invalidSchemeCode = null;
try {
  fileURLToPath('https://example.com/app.js');
} catch (error) {
  invalidSchemeCode = error.code;
}

const localPath = '/var/log/audit.log';
const convertedFileUrl = pathToFileURL(localPath);
const restoredLocalPath = fileURLToPath(convertedFileUrl);

console.log({
  pathToFileURL: convertedFileUrl.href,
  fileURLToPath: restoredLocalPath,
  invalidSchemeError: invalidSchemeCode,
});

// 6. Pola Keamanan: Validasi Pengalihan Aman (Open Redirect Defense)
console.log('\n--- 6. Uji Keamanan Open Redirect ---');
function validateRedirect(trustedOrigin, targetInput) {
  try {
    const target = new URL(targetInput, trustedOrigin);
    const isSafe = target.origin === trustedOrigin;
    return {
      input: targetInput,
      isSafe,
      redirectUrl: isSafe ? target.pathname + target.search : '/dashboard',
    };
  } catch {
    return { input: targetInput, isSafe: false, redirectUrl: '/dashboard' };
  }
}

const TRUSTED = 'https://app.example.com';
console.log({
  internalRoute: validateRedirect(TRUSTED, '/profile?tab=security'),
  maliciousRedirect: validateRedirect(TRUSTED, 'https://evil-site.com/login'),
});
