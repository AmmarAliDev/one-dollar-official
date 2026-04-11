import { spawnSync } from 'child_process';
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

describe('Prisma schema', () => {
  it('validates with `prisma validate`', () => {
    const res = spawnSync('npx prisma validate', { shell: true, stdio: 'inherit' });
    expect(res.status === 0).toBeTruthy();
  }, 120_000);

  it('can create a migration (create-only) in a temp schema to verify migration generation', () => {
    // If Prisma is not available or network/DB not present, skip by asserting graceful failure is handled.
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prisma-test-'));
    const src = path.join(process.cwd(), 'prisma', 'schema.prisma');
    const dest = path.join(tmpDir, 'schema.prisma');

    // Copy schema and switch to sqlite datasource so migrations run without external DB
    const schema = fs.readFileSync(src, 'utf-8')
      .replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"')
      .replace(/url\s*=\s*env\("DATABASE_URL"\)/g, 'url = "file:./dev.db"');

    fs.writeFileSync(dest, schema, 'utf-8');

    const uniq = `test_mig_${Date.now()}`;
    const cmd = `npx prisma migrate dev --create-only --name ${uniq} --schema "${dest}"`;

    const res = spawnSync(cmd, { shell: true, stdio: 'inherit', cwd: tmpDir });

    // Cleanup generated migration folder if present
    try {
      const migrationsDir = path.join(tmpDir, 'prisma', 'migrations');
      if (fs.existsSync(migrationsDir)) {
        fs.rmSync(migrationsDir, { recursive: true, force: true });
      }
      const devDb = path.join(tmpDir, 'dev.db');
      if (fs.existsSync(devDb)) {
        fs.rmSync(devDb, { force: true });
      }
    } catch (err) {
      // ignore cleanup errors
    }

    expect(res.status === 0).toBeTruthy();
  }, 240_000);
});
