# Structured Output MCP

Deterministic structured-output validation and repair toolkit for AI agents — the same philosophy as [polymath-megablaster-mcp](https://github.com/headlessherm-creator/polymath-megablaster-mcp), applied to a different failure mode: local/open-weight models reliably producing malformed structured output, broken regex, incorrect cron/schedule math, and imprecise financial calculations.

Fully offline, deterministic, no telemetry, no API keys.

## Tools

- **repair_json** — fix malformed JSON (trailing commas, unquoted keys, unescaped quotes) and return the parsed result.
- **validate_regex** — test a regex pattern against strings deterministically; models frequently write regex that doesn't do what they think it does.
- **cron_next_runs** — compute the next N run times for a cron expression, timezone-aware.
- **cron_validate** — validate cron expression syntax.
- **amortization_schedule** — full loan amortization table (payment/principal/interest split per month).
- **compound_interest** — exact compound interest calculation.
- **validate_against_schema** — lightweight key:type schema check against an object.

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

No `fetch`/`http` imports in `src/tools.js` — every tool is pure local computation using `jsonrepair` and `cron-parser` under the hood, both well-established, actively maintained npm packages.

## License

MIT
