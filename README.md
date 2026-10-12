# Structured Output MCP

Deterministic structured-output validation and repair toolkit for AI agents — the same philosophy as [polymath-megablaster-mcp](https://github.com/headlessherm-creator/polymath-megablaster-mcp), applied specifically to models producing malformed JSON and invalid structured output.

Fully offline, deterministic, no telemetry, no API keys.

## Tools

- **repair_json** — fix malformed JSON (trailing commas, unquoted keys, unescaped quotes) and return the parsed result.
- **validate_regex** — test a regex pattern against strings deterministically; models frequently write regex that doesn't do what they think it does.
- **validate_against_schema** — validate data against a real JSON-Schema (via [ajv](https://ajv.js.org/)) and get precise, per-field error messages.

## Setup

```bash
git clone https://github.com/headlessherm-creator/structured-output-mcp.git
cd structured-output-mcp
npm install
```

Point your MCP client at `src/index.js`:

```json
{
  "mcpServers": {
    "structured-output": {
      "command": "node",
      "args": ["/path/to/structured-output-mcp/src/index.js"]
    }
  }
}
```

## Why local

No `fetch`/`http` imports in `src/tools.js` — every tool is pure local computation using `jsonrepair` and `ajv` under the hood, both well-established, actively maintained npm packages.

## License

MIT
