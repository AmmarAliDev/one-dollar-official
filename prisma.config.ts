const prismaConfig = {
  datasource: {
    db: {
      provider: 'postgresql',
      url: { fromEnvVar: 'DATABASE_URL' },
      // Optional shadow database used by Prisma Migrate during development
      shadowDatabaseUrl: { fromEnvVar: 'SHADOW_DATABASE_URL' },
    },
  },
  // Optional generator settings helpful for programmatic tooling
  generator: {
    client: {
      provider: 'prisma-client-js',
      // default output; override via environment or Prisma schema if needed
      output: 'node_modules/.prisma/client',
    },
  },
};

export default prismaConfig;
