// SOAL 1
function parseDomainComponents(rawUrl) {
  const url = new URL(rawUrl);

  return {
    hostname: url.hostname,
    port: url.port ? Number(url.port) : url.protocol === 'https:' ? 443 : 80,
    protocol: url.protocol,
  };
}

console.log(parseDomainComponents('https://api.example.com:8443/v1'));
console.log(parseDomainComponents('https://example.com/home'));

// SOAL 2
function extractSearchParams(rawUrl) {
  const url = new URL(rawUrl);
  const searchParams = url.searchParams;

  return Object.fromEntries(
    [...new Set(searchParams.keys())].map((key) => [
      key,
      searchParams.getAll(key).length > 1
        ? searchParams.getAll(key)
        : searchParams.get(key),
    ]),
  );
}

console.log(
  extractSearchParams(
    'https://shop.example.com/products?category=electronics&color=red&color=black&page=1',
  ),
);

// SOAL 3
function buildWebhookUrl(baseUrl, route, queryParams, allowedDomains) {
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanRoute = route.startsWith('/') ? route.slice(1) : route;

  const resultUrl = new URL(cleanRoute, cleanBaseUrl);

  if (
    !allowedDomains.includes(resultUrl.hostname) ||
    resultUrl.protocol !== 'https:'
  ) {
    return {
      success: false,
      reason: 'Domain or protocol not allowed',
    };
  }

  for (const [key, value] of Object.entries(queryParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        resultUrl.searchParams.append(key, String(item));
      }
    } else if (value !== undefined && value !== null) {
      resultUrl.searchParams.set(key, String(value));
    }
  }

  resultUrl.searchParams.sort();

  if (resultUrl.href.length > 2048) {
    return {
      success: false,
      reason: 'URL length exceeds maximum limit of 2048 characters',
    };
  }

  return {
    success: true,
    fullUrl: resultUrl.href,
    paramCount: resultUrl.searchParams.size,
  };
}

console.log(
  buildWebhookUrl(
    'https://webhook.partner.com/api/v2',
    'transactions',
    { status: 'success', tags: ['payment', 'auto'] },
    ['webhook.partner.com'],
  ),
);
console.log(
  buildWebhookUrl('https://webhook.attacker.com', 'data', {}, [
    'webhook.partner.com',
  ]),
);
console.log(
  buildWebhookUrl('http://webhook.partner.com', 'data', {}, [
    'webhook.partner.com',
  ]),
);
