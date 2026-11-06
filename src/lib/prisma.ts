import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getPrismaOptions(): Record<string, any> {
  if (process.env.VERCEL) {
    const tmpDb = '/tmp/dev.db';
    if (!fs.existsSync(tmpDb)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) {
          try {
            fs.copyFileSync(c, tmpDb);
            break;
          } catch (e) {
            console.error('Failed copying SQLite to /tmp:', e);
          }
        }
      }
    }
    if (fs.existsSync(tmpDb)) {
      return {
        datasources: {
          db: {
            url: 'file:/tmp/dev.db',
          },
        },
      };
    }
  }
  return {};
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...getPrismaOptions(),
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
