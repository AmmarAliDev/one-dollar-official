import { spawnSync } from 'child_process';
import { describe, it, expect } from 'vitest';

describe('Prisma schema', () => {
  it('validates with `prisma validate`', () => {
    const res = spawnSync('npx prisma validate', { shell: true, stdio: 'inherit' });
    expect(res.status === 0).toBeTruthy();
  }, 120_000);

  it('can create a migration (create-only) to verify migration generation', () => {
    // This will create a migration folder in prisma/migrations when run locally.
    const res = spawnSync('npx prisma migrate dev --name init --create-only', { shell: true, stdio: 'inherit' });
    expect(res.status === 0).toBeTruthy();
  }, 180_000);
});
