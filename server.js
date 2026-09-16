const http = require('http');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/api/analyze' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      fs.writeFileSync('/tmp/upload.csv', body);
      exec(`./pizza_engine /tmp/upload.csv`, (err, stdout, stderr) => {
        console.log('ENGINE OUT:', stdout.slice(0,200));
        if (stderr) console.log('ENGINE ERR:', stderr);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(stdout || JSON.stringify({error: 'no stdout', stderr}));
      });
    });
    return;
  }

  let fp = req.url === '/'? '/index.html' : req.url.split('?')[0];
  fp = path.join(__dirname, fp);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); return res.end('404 '+fp); }
    res.writeHead(200, { 'Content-Type': fp.endsWith('.html')?'text/html':'text/plain' });
    res.end(data);
  });
});
server.listen(PORT, () => console.log(`🍕 http://localhost:${PORT}/`));