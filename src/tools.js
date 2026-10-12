import { jsonrepair } from 'jsonrepair';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true, strict: false });

/**
 * Deterministic tool implementations. Pure functions, no network calls.
 */

export function repairJson({ text }) {
  try {
    const repaired = jsonrepair(text);
    const parsed = JSON.parse(repaired);
    return { success: true, repaired, parsed };
  } catch (err) {
    return { success: false, error: err.message, original: text };
  }
}

export function validateRegex({ pattern, flags, testStrings }) {
  let re;
  try {
    re = new RegExp(pattern, flags || '');
  } catch (err) {
    return { success: false, error: `Invalid regex: ${err.message}` };
  }
  const results = testStrings.map((s) => {
    const match = s.match(re);
    return {
      input: s,
      matches: match !== null,
      matchedText: match ? match[0] : null,
      groups: match ? match.slice(1) : [],
    };
  });
  return { success: true, pattern, flags: flags || '', results };
}

export function validateAgainstSchema({ data, schema }) {
  // Real JSON-Schema (draft 2020-12 via ajv) validation, not a naive key:type check.
  try {
    const validateFn = ajv.compile(schema);
    const valid = validateFn(data);
    return {
      success: true,
      valid,
      errors: valid
        ? []
        : (validateFn.errors || []).map((e) => `${e.instancePath || '(root)'} ${e.message}`),
    };
  } catch (err) {
    return { success: false, error: `Invalid schema: ${err.message}` };
  }
}
