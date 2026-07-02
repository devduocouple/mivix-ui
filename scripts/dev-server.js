import { createReadStream, existsSync, statSync, watch } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';

const root = resolve('.');
const host = '127.0.0.1';
const port = Number(process.env.PORT || 4173);
const reloadPath = '/__mvx_reload';
const watchDirs = ['src', 'docs', 'examples'];
const clients = new Set();

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

const liveReloadScript = `
<script>
(() => {
  const events = new EventSource('/__mvx_reload');
  events.addEventListener('reload', () => location.reload());
})();
</script>`;

function isInsideRoot(pathname) {
  const relativePath = relative(root, pathname);
  return relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath));
}

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  let filePath = resolve(root, `.${pathname}`);
  if (!isInsideRoot(filePath)) return null;
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }
  return filePath;
}

function sendReload() {
  for (const response of clients) response.write('event: reload\ndata: now\n\n');
}

function injectLiveReload(body) {
  const closeBodyIndex = body.toLowerCase().lastIndexOf('</body>');
  if (closeBodyIndex === -1) return `${body}${liveReloadScript}`;
  return `${body.slice(0, closeBodyIndex)}${liveReloadScript}\n${body.slice(closeBodyIndex)}`;
}

async function watchDirectory(directory) {
  const absolute = join(root, directory);
  if (!existsSync(absolute)) return;
  watch(absolute, { recursive: true }, () => {
    clearTimeout(watchDirectory.timer);
    watchDirectory.timer = setTimeout(sendReload, 75);
  });
}

const server = createServer((request, response) => {
  if (request.url === reloadPath) {
    response.writeHead(200, {
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream'
    });
    response.write('\n');
    clients.add(response);
    request.on('close', () => clients.delete(response));
    return;
  }

  const filePath = resolveRequestPath(request.url);
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  const extension = extname(filePath);
  response.setHeader('Content-Type', mimeTypes[extension] || 'application/octet-stream');
  response.setHeader('Cache-Control', 'no-cache');

  if (extension !== '.html') {
    createReadStream(filePath).pipe(response);
    return;
  }

  let body = '';
  const stream = createReadStream(filePath, 'utf8');
  stream.on('data', chunk => { body += chunk; });
  stream.on('end', () => {
    response.end(injectLiveReload(body));
  });
});

await Promise.all(watchDirs.map(watchDirectory));

server.listen(port, host, async () => {
  const dirs = (await readdir(root, { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
  console.log(`Mivix UI docs running at http://${host}:${port}/docs/`);
  console.log(`Live reload watching: ${watchDirs.filter(dir => dirs.includes(dir)).join(', ')}`);
});
