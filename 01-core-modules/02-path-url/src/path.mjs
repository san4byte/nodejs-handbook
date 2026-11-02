import path from 'node:path';
import { URLSearchParams } from 'node:url';

const fullPath = path.join('uploads', 'users', 'avatar.png');
console.log('Joined:', fullPath);
console.log('Dirname:', path.dirname(fullPath));

const params = new URLSearchParams('sort=asc&limit=10');
params.set('page', '2');
params.append('filter', 'active');
console.log('Query:', params.toString());
console.log('Sort:', params.get('sort'));
