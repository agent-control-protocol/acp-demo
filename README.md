# ACP Demo — Pet Registration

Interactive demo showing an AI agent controlling a web form through the [Agent Control Protocol (ACP)](https://github.com/agent-control-protocol/acp).

The agent can fill fields, select options, click buttons, and navigate — all through natural language.

<!-- Screenshot will be added when acp-protocol.org is live -->

## Quick Start

```bash
git clone https://github.com/agent-control-protocol/acp-demo.git
cd acp-demo
npm install
cp .env.example .env     # ← edit this file and add your API key
npm start
```

The `.env` file only needs one line:

```
OPENAI_API_KEY=sk-your-key-here
```

Alternatively, pass it inline: `OPENAI_API_KEY=sk-... npm start`

Open **http://localhost:3098** and try:

> "Register my dog Max, breed Golden Retriever, owner Sarah Connor, sarah@skynet.com"

Watch the agent fill the form in real time.

## Using Other LLM Providers

Any OpenAI-compatible API works (DeepSeek, Groq, Together, local models):

```bash
OPENAI_API_KEY=sk-... OPENAI_BASE_URL=https://api.deepseek.com ACP_MODEL=deepseek-chat npm start
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | *(required)* | API key for the LLM provider |
| `OPENAI_BASE_URL` | OpenAI | Base URL for OpenAI-compatible APIs |
| `ACP_MODEL` | `gpt-4o` | Model name |
| `ACP_PORT` | `3099` | WebSocket port for the ACP server |
| `ACP_HTTP_PORT` | `3098` | HTTP port for the demo UI |

## How It Works

```
┌─────────────┐     WebSocket (ACP)      ┌─────────────────┐
│  Browser UI  │ ◄──────────────────────► │  ACP Reference   │
│  (form +     │   manifest, commands,    │  Server          │
│   chat)      │   results, chat          │  (@acprotocol/   │
└─────────────┘                           │   server)        │
                                          └────────┬────────┘
                                                   │ LLM API
                                          ┌────────▼────────┐
                                          │  OpenAI / Deep-  │
                                          │  Seek / Groq     │
                                          └─────────────────┘
```

1. The browser sends a **manifest** describing the form (fields, types, actions)
2. The user types a natural language message in the chat
3. The ACP server forwards it to the LLM along with the manifest
4. The LLM responds with structured **commands** (`fill`, `select`, `click`, etc.)
5. The browser executes each command with visual feedback and reports **results** back

## Related

- [ACP Specification](https://github.com/agent-control-protocol/acp) — protocol spec, JSON Schema, examples
- [ACP Reference Server](https://github.com/agent-control-protocol/acp-server) — `npm install @acprotocol/server`
- [acp-protocol.org](https://acp-protocol.org) — project website

## License

Apache 2.0
