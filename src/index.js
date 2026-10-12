#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  repairJson,
  validateRegex,
  cronNextRuns,
  cronValidate,
  amortizationSchedule,
  compoundInterest,
  validateAgainstSchema,
} from './tools.js';

const TOOLS = [
  {
    name: 'repair_json',
    description:
      'Repair malformed JSON (trailing commas, unescaped quotes, missing brackets) and return the parsed result.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string', description: 'Malformed JSON text to repair.' } },
      required: ['text'],
    },
  },
  {
    name: 'validate_regex',
    description:
      'Test a regex pattern against one or more strings deterministically and return match details.',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: { type: 'string' },
        flags: { type: 'string', description: 'Optional regex flags, e.g. "gi".' },
        testStrings: { type: 'array', items: { type: 'string' } },
      },
      required: ['pattern', 'testStrings'],
    },
  },
  {
    name: 'cron_next_runs',
    description: 'Compute the next N run times for a cron expression, optionally timezone-aware.',
    inputSchema: {
      type: 'object',
      properties: {
        expression: { type: 'string' },
        count: { type: 'number' },
        currentDate: { type: 'string', description: 'ISO date to compute from (default: now).' },
        tz: { type: 'string', description: 'IANA timezone, e.g. "America/New_York".' },
      },
      required: ['expression'],
    },
  },
  {
    name: 'cron_validate',
    description: 'Validate whether a cron expression is syntactically valid.',
    inputSchema: {
      type: 'object',
      properties: { expression: { type: 'string' } },
      required: ['expression'],
    },
  },
  {
    name: 'amortization_schedule',
    description: 'Compute a full loan amortization schedule (payment, principal/interest split per month).',
    inputSchema: {
      type: 'object',
      properties: {
        principal: { type: 'number' },
        annualRatePct: { type: 'number' },
        termMonths: { type: 'number' },
      },
      required: ['principal', 'annualRatePct', 'termMonths'],
    },
  },
  {
    name: 'compound_interest',
    description: 'Compute compound interest exactly given principal, rate, years, and compounding frequency.',
    inputSchema: {
      type: 'object',
      properties: {
        principal: { type: 'number' },
        annualRatePct: { type: 'number' },
        years: { type: 'number' },
        compoundsPerYear: { type: 'number' },
      },
      required: ['principal', 'annualRatePct', 'years'],
    },
  },
  {
    name: 'validate_against_schema',
    description: 'Check an object against a simple key:type schema descriptor and report missing/mistyped fields.',
    inputSchema: {
      type: 'object',
      properties: {
        data: { type: 'object' },
        schemaDescription: { type: 'object', description: 'e.g. {"name":"string","age":"number"}' },
      },
      required: ['data', 'schemaDescription'],
    },
  },
];

const HANDLERS = {
  repair_json: repairJson,
  validate_regex: validateRegex,
  cron_next_runs: cronNextRuns,
  cron_validate: cronValidate,
  amortization_schedule: amortizationSchedule,
  compound_interest: compoundInterest,
  validate_against_schema: validateAgainstSchema,
};

const server = new Server(
  { name: 'structured-output-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const handler = HANDLERS[name];
  if (!handler) {
    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  }
  try {
    const result = handler(args);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
