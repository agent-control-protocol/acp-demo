import { createServer } from "@acprotocol/server";
import OpenAI from "openai";
import { createServer as createHttpServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Load .env file (zero dependencies) ---
const envPath = resolve(__dirname, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.+?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

// --- ACP Server (WebSocket on port 3099) ---
const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL;

if (!apiKey) {
  console.error("Error: OPENAI_API_KEY environment variable is required.\n");
  console.error("Usage (pick one):");
  console.error("  1. Create a .env file:  cp .env.example .env  (then edit it)");
  console.error("  2. Inline:              OPENAI_API_KEY=sk-... npm start\n");
  console.error("Options:");
  console.error("  OPENAI_BASE_URL   LLM base URL (default: OpenAI)");
  console.error("  ACP_MODEL         Model name (default: gpt-4o)");
  console.error("  ACP_PORT          WebSocket port (default: 3099)");
  console.error("  ACP_HTTP_PORT     HTTP port for the demo UI (default: 3098)");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey,
  ...(baseURL ? { baseURL } : {}),
});

const wsPort = parseInt(process.env.ACP_PORT ?? "3099", 10);
const httpPort = parseInt(process.env.ACP_HTTP_PORT ?? "3098", 10);

const acp = createServer({
  openai,
  model: process.env.ACP_MODEL ?? "gpt-4o",
  port: wsPort,
});

await acp.start();
console.log(`ACP server running on ws://localhost:${wsPort}/connect`);
console.log(`  LLM endpoint: ${baseURL ?? "https://api.openai.com (default)"}`);
console.log(`  Model:        ${process.env.ACP_MODEL ?? "gpt-4o"}`);
console.log(`  Key prefix:   ${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`);

// --- Static HTTP server ---
const html = readFileSync(resolve(__dirname, "index.html"), "utf-8");

const http = createHttpServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html.replace("__ACP_WS_PORT__", String(wsPort)));
});

http.listen(httpPort, () => {
  console.log(`Open http://localhost:${httpPort} in your browser`);
});
