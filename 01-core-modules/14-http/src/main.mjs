import http from 'node:http';
import url from 'node:url';

const server = http.createServer((req, res) => {
  const Url = url.parse(req.url, true);

  if (Url.pathname === '/product') {
    console.info(Url.query); /* {id: '1'} */

    res.writeHead(200, 'sucess', {
      'Content-Type': 'Application/json',
      accept: 'Application/json',
    });
    res.end('hello from product');
  } else {
    if (req.method === 'POST') {
      req.addListener('data', (data) => {
        res.writeHead(200, 'sucess', {
          'Content-Type': 'Application/json',
          accept: 'Application/json',
        });
        res.end(data);
      });
    } else {
      res.writeHead(200, 'sucess', {
        'Content-Type': 'Application/json',
        accept: 'Application/json',
      });
      res.end('hello from server');
    }
  }
});

server.listen(8000);
