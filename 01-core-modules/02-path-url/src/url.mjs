import { URL, URLSearchParams } from 'node:url';

const targetUrl = new URL('https://api.example.com:8080/v1/users?role=admin&limit=10#section');

console.log('Origin:', targetUrl.origin);
console.log('Protocol:', targetUrl.protocol);
console.log('Host:', targetUrl.host);
console.log('Pathname:', targetUrl.pathname);
console.log('Hash:', targetUrl.hash);

targetUrl.searchParams.append('sort', 'desc');
console.log('Role param:', targetUrl.searchParams.get('role'));
console.log('Has limit:', targetUrl.searchParams.has('limit'));
console.log('Full Search:', targetUrl.search);
