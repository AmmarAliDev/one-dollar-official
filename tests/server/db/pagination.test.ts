import { describe, expect, it } from 'vitest';

import { AppError } from '@/lib/errors/app-error';
import {
  createPaginatedResult,
  createPaginationMeta,
  normalizePagination,
} from '@/server/db';

describe('pagination helpers', () => {
  it('normalizes pagination input and calculates offset values', () => {
    expect(normalizePagination({ page: '2', pageSize: '10' })).toEqual({
      page: 2,
      pageSize: 10,
      skip: 10,
      take: 10,
    });
  });

  it('caps page size to the configured maximum', () => {
    expect(normalizePagination({ page: 1, pageSize: 250 }, { maxPageSize: 50 })).toEqual({
      page: 1,
      pageSize: 50,
      skip: 0,
      take: 50,
    });
  });

  it('throws a typed error for invalid pagination values', () => {
    expect(() => normalizePagination({ page: 0 })).toThrowError(AppError);
  });

  it('creates consistent pagination metadata and paginated results', () => {
    const pagination = normalizePagination({ page: 2, pageSize: 3 });

    expect(createPaginationMeta(8, pagination)).toEqual({
      currentPage: 2,
      pageSize: 3,
      totalItems: 8,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });

    expect(
      createPaginatedResult({
        items: ['a', 'b', 'c'],
        totalItems: 8,
        pagination,
      }),
    ).toEqual({
      items: ['a', 'b', 'c'],
      meta: {
        currentPage: 2,
        pageSize: 3,
        totalItems: 8,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });
  });
});