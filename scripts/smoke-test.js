/**
 * Smoke test pentru API-urile principale Aventura Travel
 */
const http = require('http');

const BASE = process.env.TEST_BASE || 'http://127.0.0.1:8080';

function req(method, path, body, cookie) {
  return new Promise((resolve, reject) => {
    const u = new URL(BASE + path);
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method,
      headers: {
        Accept: 'application/json',
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
    };
    const r = http.request(opts, (res) => {
      let buf = '';
      res.on('data', (c) => (buf += c));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(buf);
        } catch (_) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json || buf,
          cookie: (res.headers['set-cookie'] || [])[0],
        });
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function run() {
  const fails = [];
  const ok = (name, cond, detail) => {
    if (cond) console.log('✓', name);
    else {
      console.log('✗', name, detail || '');
      fails.push(name);
    }
  };

  let r = await req('GET', '/');
  ok('Home 200', r.status === 200);

  r = await req('GET', '/api/search?tip=urban');
  ok('Search urban', r.status === 200 && r.body.count > 0, r.body);

  r = await req('POST', '/api/auth/login', {
    email: 'client@aventuratravel.ro',
    parola: 'client123',
  });
  ok('Login client', r.status === 200 && r.body.ok, r.body);
  const cookie = (r.headers['set-cookie'] || [])[0]?.split(';')[0];

  r = await req('GET', '/api/recomandari', null, cookie);
  ok('Recomandări', r.status === 200 && Array.isArray(r.body.pachete), r.body);

  r = await req('POST', '/api/chat', { mesaj: 'Care e programul agenției?' });
  ok('Chatbot program', r.status === 200 && /09:00|program/i.test(r.body.raspuns), r.body);

  r = await req('GET', '/api/harta');
  ok('Hartă API', r.status === 200 && r.body.pachete?.length > 0);

  r = await req('POST', '/api/auth/login', {
    email: 'admin@aventuratravel.ro',
    parola: 'admin123',
  });
  const adminCookie = (r.headers['set-cookie'] || [])[0]?.split(';')[0];
  ok('Login admin', r.status === 200);

  r = await req('GET', '/api/admin/stats', null, adminCookie);
  ok('Admin stats', r.status === 200 && typeof r.body.clienti === 'number', r.body);

  if (fails.length) {
    console.error('\nFAILED:', fails.join(', '));
    process.exit(1);
  }
  console.log('\nToate testele au trecut.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
