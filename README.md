# JSON Mender MCP — Fix Malformed JSON, Validate JSON Schema, Test Regex for AI Agents

A free, local MCP server that fixes broken JSON output from LLMs, validates data against a real JSON Schema, and tests regex patterns deterministically — no API keys, no network calls, no telemetry.

If you're building an AI agent and keep hitting `JSONDecodeError`, unterminated strings, trailing commas, or unquoted keys in model output, this is the MCP server for that exact problem.

Same local-first, deterministic philosophy as [polymath-megablaster-mcp](https://github.com/headlessherm-creator/polymath-megablaster-mcp), applied specifically to the "model wrote JSON that doesn't parse" problem.

## The problem this solves

LLMs — especially smaller or local models (Llama, Qwen, Mistral) — routinely produce JSON that looks right but fails to parse: trailing commas, single quotes instead of double, unescaped inner quotes, missing commas, truncated output. Asking the model to "fix the JSON" usually just produces a second broken attempt. `repair_json` fixes it deterministically, every time, the same way, with no second model call needed.

## Tools

- **repair_json** — fix malformed/invalid JSON (trailing commas, unquoted keys, unescaped quotes, truncated structures) and return the corrected, parsed result. Built on [`jsonrepair`](https://www.npmjs.com/package/jsonrepair).
- **validate_regex** — test a regex pattern against one or more strings deterministically. Useful because models frequently write regex that compiles but doesn't match what they think it matches.
- **validate_against_schema** — validate any JSON data against a real [JSON Schema](https://json-schema.org/) (via [ajv](https://ajv.js.org/), the most widely used JS Schema validator) and get precise, per-field, human-readable error messages instead of a generic pass/fail.

## Setup

**1. Install Node.js** (v18+) if you don't have it: https://nodejs.org

**2. Clone and install:**

```bash
git clone https://github.com/headlessherm-creator/json-mender-mcp.git
cd json-mender-mcp
npm install
```

**3. Point your MCP client at it:**

```json
{
  "mcpServers": {
    "json-mender": {
      "command": "node",
      "args": ["/path/to/json-mender-mcp/src/index.js"]
    }
  }
}
```

Setup docs for common clients:
- Claude Desktop: https://modelcontextprotocol.io/quickstart/user
- Cursor: https://docs.cursor.com/context/model-context-protocol
- Claude Code: https://docs.claude.com/en/docs/claude-code/mcp

## Why local

No `fetch`/`http` import anywhere in `src/tools.js` — every tool runs as pure local computation using `jsonrepair` and `ajv`, both well-established, actively maintained npm packages. Nothing you send through this server leaves your machine.

## Keywords

JSON repair MCP server, fix broken JSON from LLM, malformed JSON parser, JSON schema validation MCP, regex tester MCP, local MCP server no API key, Claude MCP JSON tools, AI agent structured output validation.

## License

MIT
