import http from 'node:http';
import fs from 'node:fs';
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const name = new URL(req.url, 'http://x').searchParams.get('name');
  if (!/^[\w.-]+\.png$/.test(name || '')) { res.writeHead(400); return res.end('bad'); }
  let chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const b64 = Buffer.concat(chunks).toString().replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('C:/Projects/Ravora/public/' + name, Buffer.from(b64, 'base64'));
    res.writeHead(200); res.end('ok');
  });
}).listen(5599, '127.0.0.1');
