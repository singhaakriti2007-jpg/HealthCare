import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function setupDatabaseUrl(): string {
  // If a PostgreSQL or external database URL is provided, use it directly
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL;
  }

  // On Vercel serverless functions, copy the seeded SQLite db to /tmp so writes succeed
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            break;
          } catch (e) {
            console.error('Failed to copy SQLite database to /tmp:', e);
          }
        }
      }
    }
    const finalUrl = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = finalUrl;
    return finalUrl;
  }

  const defaultUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  process.env.DATABASE_URL = defaultUrl;
  return defaultUrl;
}

const dbUrl = setupDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: dbUrl,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
