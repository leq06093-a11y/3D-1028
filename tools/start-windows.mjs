import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.ico':'image/x-icon','.json':'application/json'};
try { await stat(path.join(root, 'index.html')); }
catch { console.error('Missing dist/index.html. Extract the entire ZIP before starting.'); process.exit(1); }
const server = http.createServer(async (req, res) => {
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return;}
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); }
  catch {res.writeHead(400);res.end();return;}
  const filename = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!filename.startsWith(root) || pathname.includes('\\') || pathname.includes('\0')) {res.writeHead(403);res.end();return;}
  try {
    const content = await readFile(filename);
    res.writeHead(200, {'Content-Type':mime[path.extname(filename)] || 'application/octet-stream','Content-Length':content.length,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch {res.writeHead(404);res.end('Not found');}
});
server.on('error', error => {
  if(error.code === 'EADDRINUSE') {server.listen(0, '127.0.0.1');return;}
  console.error('Cannot start:', error.message);process.exitCode=1;
});
server.on('listening', () => {
  const url = `http://127.0.0.1:${server.address().port}/`;
  console.log(`\nORBIT is running: ${url}\nKeep this window open. Close it or press Ctrl+C to stop.\nIf the browser does not open, copy the address above into Edge or Chrome.\n`);
  if (process.platform === 'win32') {
    const browser = spawn('cmd.exe', ['/d', '/c', 'start', '', url], {stdio:'ignore',windowsHide:true});
    browser.on('error',()=>console.log('Open the address above in your browser.'));
    browser.unref();
  }
});
server.listen(5173, '127.0.0.1');
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
