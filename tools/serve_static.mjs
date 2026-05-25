#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = options.demoBasicSite
    ? await prepareDemoSite()
    : path.resolve(options.root || '.');

  if (options.check) {
    await assertDirectory(root);
    console.log(JSON.stringify({ status: 'pass', root, port: options.port }, null, 2));
    return;
  }

  await assertDirectory(root);
  const server = http.createServer((request, response) => {
    serveRequest(root, request, response).catch(error => {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(`RefSciLink static server error: ${error.message}`);
    });
  });

  server.listen(options.port, options.host, () => {
    const baseUrl = `http://${options.host}:${options.port}`;
    console.log(`RefSciLink static server running at ${baseUrl}/`);
    console.log(`Serving: ${root}`);
    if (options.demoBasicSite) {
      console.log(`Demo: ${baseUrl}/index.html`);
      console.log(`References: ${baseUrl}/data/reference_bibliographique/index_ref.html`);
    }
  });
}

function parseArgs(args) {
  const options = {
    root: '',
    host: '127.0.0.1',
    port: 8000,
    demoBasicSite: false,
    check: false
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--host') {
      options.host = args[++index] || options.host;
    } else if (arg === '--port') {
      options.port = Number(args[++index] || options.port);
    } else if (arg === '--demo-basic-site') {
      options.demoBasicSite = true;
    } else if (arg === '--check') {
      options.check = true;
    } else if (!arg.startsWith('-') && !options.root) {
      options.root = arg;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
}

async function assertDirectory(root) {
  const stats = await fs.stat(root);
  if (!stats.isDirectory()) throw new Error(`Static root is not a directory: ${root}`);
}

async function prepareDemoSite() {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'refscilink-demo-'));
  await fs.cp(path.join(repoRoot, 'examples/basic-site'), tempRoot, { recursive: true });
  await fs.cp(path.join(repoRoot, 'data'), path.join(tempRoot, 'data'), { recursive: true });
  return tempRoot;
}

async function serveRequest(root, request, response) {
  const requestUrl = new URL(request.url || '/', 'http://localhost');
  const pathname = decodeURIComponent(requestUrl.pathname);
  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(root, safePath);
  const relative = path.relative(root, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  if (!existsSync(filePath)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  const stats = await fs.stat(filePath);
  if (stats.isDirectory()) filePath = path.join(filePath, 'index.html');
  if (!existsSync(filePath)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': contentType(filePath),
    'Cache-Control': filePath.endsWith('.json') ? 'no-cache' : 'public, max-age=60'
  });
  createReadStream(filePath).pipe(response);
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.svg': 'image/svg+xml'
  }[ext] || 'application/octet-stream';
}

main().catch(error => {
  console.error(`RefSciLink static server failed: ${error.message}`);
  process.exit(1);
});
