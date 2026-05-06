import 'dotenv/config';

const required = ['NODE_ENV', 'PORT'] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  NODE_ENV: process.env['NODE_ENV'] as 'development' | 'production' | 'test',
  PORT: Number(process.env['PORT']),
} as const;
