import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

const envPath = path.resolve(process.cwd(), '.env');
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const idx = line.indexOf('=');
      const key = line.slice(0, idx);
      let value = line.slice(idx + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return [key, value];
    })
);

const client = new Client({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
  },
});

try {
  await client.connect();
  const { rows } = await client.query('select current_database() as db, current_user as user');
  console.log('connected', rows[0]);
} catch (error) {
  console.error('connection_failed', error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
