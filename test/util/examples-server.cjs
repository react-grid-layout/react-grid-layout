#!/usr/bin/env node
/**
 * Minimal static server for the e2e examples.
 *
 * The built example HTML references assets under the absolute path
 * `/react-grid-layout/examples/...` (set by CONTENT_BASE at build time,
 * matching the gh-pages deployment). A bare `python3 -m http.server`
 * cannot serve that prefix, so this maps it to the on-disk `examples/`
 * directory and serves everything else from the repo root.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.RGL_PORT || 4002);
const ROOT = process.cwd();
const PREFIX = "/react-grid-layout/examples";

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".map": "application/json"
};

const server = http.createServer((request, response) => {
  const url = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  // Map the CONTENT_BASE prefix to the examples dir.
  let relative = url.startsWith(PREFIX) ? url.slice(PREFIX.length) : url;
  if (relative.endsWith("/") || relative === "") relative += "/00-showcase.html";
  const file = path.normalize(path.join(ROOT, relative));
  if (!file.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("forbidden");
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("not found: " + url);
      return;
    }
    const extension = path.extname(file).toLowerCase();
    response.writeHead(200, {
      "Content-Type": MIME[extension] || "application/octet-stream"
    });
    response.end(data);
  });
});

server.listen(PORT, "localhost", () => {
  console.log(`examples server on http://localhost:${PORT} (prefix ${PREFIX})`);
});
