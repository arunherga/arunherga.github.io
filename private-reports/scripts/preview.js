// Local UI preview only. This file is not the Worker entry point or a static asset.
// The production Worker has no preview flag, query parameter, or auth bypass.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createHandler } from "../src/worker.js";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const fixtures = resolve(appRoot, "../outputs/private-reports");
const reports = Object.fromEntries(await Promise.all(["equity", "recycling"].map(async kind => [kind, JSON.parse(await readFile(resolve(fixtures, `${kind}.json`), "utf8"))])));
const types = { "index.html": "text/html; charset=utf-8", "app.js": "text/javascript", "view.js": "text/javascript", "styles.css": "text/css", "favicon.svg": "image/svg+xml" };
const handler = createHandler({
  verify: async () => ({ email: "Local preview — sign-in not connected" }),
  read: async (kind, path) => {
    const date = reports[kind].run_date || reports[kind].date;
    if (path === "data/daily") return [{ name: `${date}.json`, type: "file" }];
    if (path !== `data/daily/${date}.json`) throw new Error("No local fixture for this date");
    return reports[kind];
  },
});
const assets = {
  async fetch(request) {
    const pathname = new URL(request.url).pathname;
    const filename = pathname === "/" ? "index.html" : pathname.slice(1);
    if (!Object.hasOwn(types, filename)) return new Response("Not found", { status: 404 });
    let body = await readFile(resolve(appRoot, "public", filename));
    if (filename === "index.html") body = body.toString().replace('<body>', '<body><div class="preview-banner">LOCAL PREVIEW · Cloudflare sign-in is not connected yet</div>');
    return new Response(body, { headers: { "Content-Type": types[filename] } });
  },
};
const port = 4173;
createServer(async (req, res) => {
  if (!["127.0.0.1:4173", "localhost:4173"].includes(req.headers.host) || (req.headers.origin && !["http://127.0.0.1:4173", "http://localhost:4173"].includes(req.headers.origin))) {
    res.writeHead(403); res.end(); return;
  }
  try {
    const response = await handler(new Request(`http://127.0.0.1:${port}${req.url}`, { method: req.method }), { ASSETS: assets });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(500); res.end("Preview error"); }
}).listen(port, "127.0.0.1", () => console.log(`Local preview: http://127.0.0.1:${port} (not deployed; authentication tested separately)`));
