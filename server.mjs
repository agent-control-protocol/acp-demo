import { createServer } from "@acprotocol/server";
import OpenAI from "openai";
import { createServer as createHttpServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- ACP Server (WebSocket on port 3099) ---
const apiKey = process.env.OPENAI_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL;

if (!apiKey) {
  console.error("Error: OPENAI_API_KEY environment variable is required.\n");
  console.error("Usage:");
  console.error("  OPENAI_API_KEY=sk-... npm start\n");
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

// --- Static HTTP server ---
const html = readFileSync(resolve(__dirname, "index.html"), "utf-8");

const http = createHttpServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html.replace("__ACP_WS_PORT__", String(wsPort)));
});

http.listen(httpPort, () => {
  console.log(`Open http://localhost:${httpPort} in your browser`);
});
