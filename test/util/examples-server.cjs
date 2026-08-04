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
const http = require("http");
const fs = require("fs");
const path = require("path");

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

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  // Map the CONTENT_BASE prefix to the examples dir.
  let rel = url.startsWith(PREFIX) ? url.slice(PREFIX.length) : url;
  if (rel.endsWith("/") || rel === "") rel += "/00-showcase.html";
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("not found: " + url);
      return;
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, "localhost", () => {
  console.log(`examples server on http://localhost:${PORT} (prefix ${PREFIX})`);
});
