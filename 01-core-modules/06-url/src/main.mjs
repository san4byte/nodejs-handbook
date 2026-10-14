import { URL } from 'node:url';

const myUrl = new URL('https://codesann.com/profile?age=21');

myUrl.searchParams.append('country', 'indonesia');

console.info(myUrl);

/*
output:
URL {
  href: 'https://codesann.com/profile?age=21&country=indonesia',
  origin: 'https://codesann.com',
  protocol: 'https:',
  username: '',
  password: '',
  host: 'codesann.com',
  hostname: 'codesann.com',
  port: '',
  pathname: '/profile',
  search: '?age=21&country=indonesia',
  searchParams: URLSearchParams { 'age' => '21', 'country' => 'indonesia' },
  hash: ''
}
*/

const BASE_API = 'https://api.stripe.com/v1/';

// Gabungkan endpoint tanpa takut salah tanda slash '/'
const chargeUrl = new URL('charges?q=query', BASE_API);
console.log(chargeUrl);
