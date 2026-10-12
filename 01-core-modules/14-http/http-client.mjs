import https from 'node:https';

const url = 'https://eofeih3io4xch6p.m.pipedream.net';

const request = https.request(
  url,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'Application/json',
      Accept: 'Application/json',
    },
  },
  (response) => {
    response.addListener('data', (data) => {
      console.info(`Recipe data : ${data.toString()}`);
    });
  },
);

const data = JSON.stringify({
  firstName: 'Joko',
  lastName: 'Santoso',
});

request.write(data);
request.end();
