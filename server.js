const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
let clients = [];

// file types
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  // hot reload endpoint
  if (req.url === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    clients.push(res);
    req.on('close', () => {
      clients = clients.filter(c => c!== res);
    });
    return;
  }

  let filePath = req.url === '/'? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('404 pizza not found');
    }

    // inject reload script into html
    if (ext === '.html' || req.url === '/') {
      const inject = `<script>
        const s = new EventSource('/__reload');
        s.onmessage = () => location.reload();
        console.log('🍕 hot reload connected');
      </script>`;
      data = data.toString().replace('</body>', inject + '</body>');
    }

    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(data);
  });
});

// watch files
fs.watch(__dirname, { recursive: true }, (event, filename) => {
  if (filename &&!filename.includes('node_modules') &&!filename.includes('.git')) {
    console.log(`♻️ ${filename} changed - reloading...`);
    clients.forEach(c => c.write('data: reload\n\n'));
  }
});

server.listen(PORT, () => {
  console.log(`🍕 http://localhost:${PORT}/ — editing any file will reload browser`);
});