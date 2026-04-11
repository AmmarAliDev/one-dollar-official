const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Running minimal seed: roles + default category');

  const roles = [
    'SUPER_ADMIN',
    'PRODUCT_MANAGER',
    'ORDER_MANAGER',
    'CUSTOMER',
    'GUEST',
  ];

  for (const key of roles) {
    try {
      await prisma.role.upsert({
        where: { key },
        update: {},
        create: {
          key,
          name: key,
          permissions: {},
        },
      });
      console.log(`Ensured role: ${key}`);
    } catch (err) {
      console.error('Failed to upsert role', key, err);
      throw err;
    }
  }

  try {
    await prisma.category.upsert({
      where: { slug: 'uncategorized' },
      update: {},
      create: {
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Default category',
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
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
