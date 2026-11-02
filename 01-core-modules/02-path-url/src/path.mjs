import path from 'node:path';
import { URL } from 'node:url';

const target = path.join('uploads', 'report.pdf');
console.log('Joined:', target);

const endpoint = new URL('https://api.site.com/v1/search?q=node');
endpoint.searchParams.append('page', '2');
console.log('Search:', endpoint.search);
