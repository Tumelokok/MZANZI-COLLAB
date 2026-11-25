import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
let settings;
try {
  settings = parseEnv(readFileSync(new URL('../.env.campaign-local', import.meta.url), 'utf8'));
} catch {
  console.error('Create web/.env.campaign-local using docs/creator-intelligence-campaigns.md first. Your existing .env.local is unchanged.');
  process.exit(1);
}
let api;
try { api = new URL(settings.NEXT_PUBLIC_SUPABASE_URL); } catch { /* Validated below. */ }
if (!api || api.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(api.hostname) || api.username || api.password || api.pathname !== '/' || api.search || api.hash || !settings.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()) {
  console.error('Local campaign testing requires an HTTP localhost Supabase URL and its local publishable/anon key. Hosted URLs are refused.');
  process.exit(1);
}
console.log('Starting local campaign testing at http://127.0.0.1:3001. Supabase must be running locally.');
const child = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url)), 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', '3001'], {
  cwd: root, stdio: 'inherit',
  env: {
    ...process.env,
    // Explicit process values take precedence over Next's existing .env.local.
    NEXT_PUBLIC_SUPABASE_URL: api.origin,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: settings.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3001',
  },
});
child.on('error', () => { console.error('Could not start the local Next.js server.'); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
