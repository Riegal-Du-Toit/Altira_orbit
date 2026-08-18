#!/usr/bin/env node

// Read-only HTTP baseline for controlled endpoint testing.
// This intentionally supports GET requests only and does not create test data.

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const value = process.argv[index];
  if (!value.startsWith('--')) continue;
  const [key, inlineValue] = value.slice(2).split('=', 2);
  args.set(key, inlineValue ?? process.argv[++index]);
}

const url = args.get('url');
const concurrency = Number(args.get('concurrency') ?? 1);
const requests = Number(args.get('requests') ?? 20);

if (!url || !Number.isInteger(concurrency) || concurrency < 1 || concurrency > 100 ||
    !Number.isInteger(requests) || requests < 1 || requests > 10000) {
  console.error('Usage: node scripts/load-testing/read-only-http-baseline.mjs --url <GET_URL> [--concurrency 5] [--requests 100]');
  process.exit(2);
}

const target = new URL(url);
const durations = [];
const statuses = new Map();
let nextRequest = 0;

async function worker() {
  while (true) {
    const requestNumber = nextRequest++;
    if (requestNumber >= requests) return;

    const started = performance.now();
    try {
      const response = await fetch(target, { method: 'GET', redirect: 'manual' });
      const duration = performance.now() - started;
      durations.push(duration);
      statuses.set(response.status, (statuses.get(response.status) ?? 0) + 1);
      await response.arrayBuffer();
    } catch (error) {
      const duration = performance.now() - started;
      durations.push(duration);
      const label = error instanceof Error ? error.name : 'request-error';
      statuses.set(label, (statuses.get(label) ?? 0) + 1);
    }
  }
}

const started = Date.now();
await Promise.all(Array.from({ length: Math.min(concurrency, requests) }, worker));
durations.sort((left, right) => left - right);

const percentile = (value) => durations[Math.min(durations.length - 1, Math.ceil(durations.length * value) - 1)];
const average = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
const elapsedSeconds = (Date.now() - started) / 1000;

console.log(`Target: ${target}`);
console.log(`Requests: ${requests}`);
console.log(`Concurrency: ${concurrency}`);
console.log(`Elapsed: ${elapsedSeconds.toFixed(2)}s`);
console.log(`Throughput: ${(requests / elapsedSeconds).toFixed(2)} req/s`);
console.log(`Latency ms: avg=${average.toFixed(2)} p50=${percentile(0.50).toFixed(2)} p95=${percentile(0.95).toFixed(2)} p99=${percentile(0.99).toFixed(2)} max=${durations.at(-1).toFixed(2)}`);
console.log(`Statuses: ${JSON.stringify(Object.fromEntries(statuses))}`);
