const prismaConfig = {
  datasource: {
    db: {
      provider: 'postgresql',
      url: { fromEnvVar: 'DATABASE_URL' },
    },
  },
};

export default prismaConfig;
