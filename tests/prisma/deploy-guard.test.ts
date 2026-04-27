import { spawnSync } from 'child_process';
import path from 'path';
import { describe, expect, it } from 'vitest';

const guardScriptPath = path.join(process.cwd(), 'scripts', 'guard-deploy-workflow.mjs');

describe('Deploy workflow guard', () => {
  it('blocks build:deploy in local development by default', () => {
    const res = spawnSync(process.execPath, [guardScriptPath], {
      encoding: 'utf-8',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        VERCEL: '',
        CI: '',
        PRISMA_ALLOW_LOCAL_DEPLOY_BUILD: '',
      },
    });

    expect(res.status).toBe(1);
    expect(res.stderr || res.stdout).toMatch(/Refusing to run build:deploy/i);
  });

  it('allows build:deploy in deployment context', () => {
    const res = spawnSync(process.execPath, [guardScriptPath], {
      encoding: 'utf-8',
      env: {
        ...process.env,
        VERCEL: '1',
      },
    });

    expect(res.status).toBe(0);
  });

  it('allows explicit local deploy pipeline rehearsal override', () => {
    const res = spawnSync(process.execPath, [guardScriptPath], {
      encoding: 'utf-8',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        VERCEL: '',
        CI: '',
        PRISMA_ALLOW_LOCAL_DEPLOY_BUILD: 'true',
      },
    });

    expect(res.status).toBe(0);
  });
});
