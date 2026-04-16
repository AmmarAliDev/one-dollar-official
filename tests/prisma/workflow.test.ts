import { describe, expect, it } from 'vitest';

async function loadWorkflowHelpers() {
  const moduleUrl = new URL('../../scripts/prisma-env.mjs', import.meta.url).href;
  return import(moduleUrl);
}

const isolatedCwd = new URL('./__prisma_env_isolated__/', import.meta.url).pathname;

describe('Prisma workflow helpers', () => {
  it('falls back to DATABASE_URL when POSTGRES_URL_NON_POOLING is not set', async () => {
    const { buildPrismaProcessEnv } = await loadWorkflowHelpers();
    const env = buildPrismaProcessEnv(
      {
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/one_dollar_dev?schema=public',
      },
      isolatedCwd,
    );

    expect(env.POSTGRES_URL_NON_POOLING).toBe(env.DATABASE_URL);
  });

  it('allows prisma migrate dev for a local database URL', async () => {
    const { getMigrateDevSafetyCheck } = await loadWorkflowHelpers();
    const result = getMigrateDevSafetyCheck(
      {
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/one_dollar_dev?schema=public',
      },
      isolatedCwd,
    );

    expect(result.allowed).toBe(true);
  });

  it('blocks prisma migrate dev for obvious hosted Supabase URLs', async () => {
    const { getMigrateDevSafetyCheck } = await loadWorkflowHelpers();
    const result = getMigrateDevSafetyCheck(
      {
        DATABASE_URL:
          'postgresql://postgres:secret@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
      },
      isolatedCwd,
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/hosted|production/i);
  });

  it('allows an explicit override for intentional remote development databases', async () => {
    const { getMigrateDevSafetyCheck } = await loadWorkflowHelpers();
    const result = getMigrateDevSafetyCheck(
      {
        DATABASE_URL:
          'postgresql://postgres:secret@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
        PRISMA_ALLOW_HOSTED_MIGRATE_DEV: 'true',
      },
      isolatedCwd,
    );

    expect(result.allowed).toBe(true);
  });
});
