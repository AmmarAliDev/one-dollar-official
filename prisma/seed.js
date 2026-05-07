const { PrismaClient } = require('@prisma/client');

let prisma;

async function loadPrismaEnv() {
  const { resolvePrismaEnv } = await import('../scripts/prisma-env.mjs');
  const { env } = resolvePrismaEnv(process.env, process.cwd());

  Object.assign(process.env, env);

  return env;
}

async function main() {
  await loadPrismaEnv();
  prisma = new PrismaClient();

  console.log('Running minimal seed: roles + default category');

  const roles = [
    {
      key: 'SUPER_ADMIN',
      name: 'Super admin',
      permissions: [
        'admin:access',
        'catalog:read',
        'catalog:write',
        'orders:read',
        'orders:write',
        'users:read',
        'settings:manage',
      ],
    },
    {
      key: 'PRODUCT_MANAGER',
      name: 'Product manager',
      permissions: ['admin:access', 'catalog:read', 'catalog:write', 'orders:read'],
    },
    {
      key: 'ORDER_MANAGER',
      name: 'Order manager',
      permissions: ['admin:access', 'orders:read', 'orders:write', 'users:read'],
    },
    {
      key: 'CUSTOMER',
      name: 'Customer',
      permissions: [],
    },
    {
      key: 'GUEST',
      name: 'Guest',
      permissions: [],
    },
  ];

  for (const role of roles) {
    try {
      await prisma.role.upsert({
        where: { key: role.key },
        update: {
          name: role.name,
          permissions: role.permissions,
        },
        create: {
          key: role.key,
          name: role.name,
          permissions: role.permissions,
        },
      });
      console.log(`Ensured role: ${role.key}`);
    } catch (err) {
      console.error('Failed to upsert role', role.key, err);
      throw err;
    }
  }

  try {
    await prisma.category.upsert({
      where: { slug: 'uncategorized' },
      update: {
        status: 'PUBLISHED',
      },
      create: {
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Default category',
        status: 'PUBLISHED',
      },
    });
    console.log('Ensured default category: uncategorized');
  } catch (err) {
    console.error('Failed to ensure default category', err);
    throw err;
  }

  console.log('Minimal seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    // Set non-zero exit code but allow finally() to run so prisma disconnects cleanly.
    process.exitCode = 1;
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
