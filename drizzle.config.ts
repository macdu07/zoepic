import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env.local' });
config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not configured. Copy .env.example to .env.local and add your Neon connection string.');
}

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
