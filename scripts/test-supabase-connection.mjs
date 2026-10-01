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

const placeholderHost =
  !env.DATABASE_HOST ||
  env.DATABASE_HOST.includes('your-project-region') ||
  env.DATABASE_USERNAME?.includes('your-project-ref');

if (placeholderHost) {
  console.error(
    'connection_failed Replace DATABASE_HOST and DATABASE_USERNAME in .env with your real Supabase session-pooler values. .env.example placeholders will not connect.'
  );
  process.exit(1);
}

const ssl =
  env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : undefined;

const client = new Client({
  host: env.DATABASE_HOST,
  port: Number(env.DATABASE_PORT || 5432),
  database: env.DATABASE_NAME || 'postgres',
  user: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
  ssl,
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
