import type { DatabaseExecutor } from '@/server/db/client';
import { resolveDbExecutor } from '@/server/db/client';

export type RepositoryContext = Readonly<{
  db: DatabaseExecutor;
}>;

export type ServiceContext = RepositoryContext;

export function createRepositoryContext(db?: DatabaseExecutor): RepositoryContext {
  return {
    db: resolveDbExecutor(db),
  };
}

export function createServiceContext(db?: DatabaseExecutor): ServiceContext {
  return createRepositoryContext(db);
}

export function defineRepository<Repository>(
  factory: (context: RepositoryContext) => Repository,
): (db?: DatabaseExecutor) => Repository {
  return (db?: DatabaseExecutor) => factory(createRepositoryContext(db));
}

export function defineService<Service>(
  factory: (context: ServiceContext) => Service,
): (db?: DatabaseExecutor) => Service {
  return (db?: DatabaseExecutor) => factory(createServiceContext(db));
}