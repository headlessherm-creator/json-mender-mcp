import { jsonrepair } from 'jsonrepair';
import { CronExpressionParser } from 'cron-parser';
import { z } from 'zod';

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

export function cronNextRuns({ expression, count = 5, currentDate, tz }) {
  try {
    const options = {};
    if (currentDate) options.currentDate = currentDate;
    if (tz) options.tz = tz;
    const interval = CronExpressionParser.parse(expression, options);
    const runs = [];
    for (let i = 0; i < count; i++) {
      runs.push(interval.next().toISOString());
    }
    return { success: true, expression, nextRuns: runs };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function cronValidate({ expression }) {
  try {
    CronExpressionParser.parse(expression);
    return { success: true, valid: true, expression };
  } catch (err) {
    return { success: true, valid: false, expression, error: err.message };
  }
}

export function amortizationSchedule({ principal, annualRatePct, termMonths }) {
  const monthlyRate = annualRatePct / 100 / 12;
  const payment =
    monthlyRate === 0
      ? principal / termMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
        (Math.pow(1 + monthlyRate, termMonths) - 1);
  let balance = principal;
  const schedule = [];
  for (let month = 1; month <= termMonths; month++) {
    const interestPortion = balance * monthlyRate;
    const principalPortion = payment - interestPortion;
    balance -= principalPortion;
    schedule.push({
      month,
      payment: round2(payment),
      principalPortion: round2(principalPortion),
      interestPortion: round2(interestPortion),
      remainingBalance: round2(Math.max(balance, 0)),
    });
  }
  return {
    success: true,
    monthlyPayment: round2(payment),
    totalPaid: round2(payment * termMonths),
    totalInterest: round2(payment * termMonths - principal),
    schedule,
  };
}

export function compoundInterest({ principal, annualRatePct, years, compoundsPerYear = 12 }) {
  const rate = annualRatePct / 100;
  const n = compoundsPerYear;
  const amount = principal * Math.pow(1 + rate / n, n * years);
  return {
    success: true,
    finalAmount: round2(amount),
    totalInterestEarned: round2(amount - principal),
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

export function validateAgainstSchema({ data, schemaDescription }) {
  // Lightweight structural check: required keys + type checks from a simple descriptor,
  // not a full JSON-Schema implementation (keeps this dependency-free beyond zod's base use).
  const errors = [];
  for (const [key, expectedType] of Object.entries(schemaDescription)) {
    if (!(key in data)) {
      errors.push(`Missing required key: ${key}`);
      continue;
    }
    const actualType = Array.isArray(data[key]) ? 'array' : typeof data[key];
    if (actualType !== expectedType) {
      errors.push(`Key "${key}" expected type ${expectedType}, got ${actualType}`);
    }
  }
  return { success: true, valid: errors.length === 0, errors };
}
