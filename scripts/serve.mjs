import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

const root = resolve("out");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
};
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const data = await readFile(file);
    response.setHeader(
      "Content-Type",
      `${types[extname(file)] || "application/octet-stream"}; charset=utf-8`,
    );
    response.setHeader("X-Content-Type-Options", "nosniff");
    if (pathname.startsWith("/examples/strict/"))
      response.setHeader(
        "Content-Security-Policy",
        "default-src 'none'; script-src 'self'; style-src 'nonce-microonboard-test'; style-src-attr 'none'; img-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'",
      );
    response.writeHead(200).end(data);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}).listen(Number(process.env.PORT || 4173), "127.0.0.1", () =>
  process.stdout.write("Static export available at http://127.0.0.1:4173\n"),
);
