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
    name: 'validate_against_schema',
    description: 'Validate data against a real JSON-Schema (draft 2020-12) and report all errors.',
    inputSchema: {
      type: 'object',
      properties: {
        data: { description: 'The data to validate (any JSON value).' },
        schema: { type: 'object', description: 'A JSON-Schema object.' },
      },
      required: ['data', 'schema'],
    },
  },
];

const HANDLERS = {
  repair_json: repairJson,
  validate_regex: validateRegex,
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
