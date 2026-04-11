import { describe, expect, it } from 'vitest';

import { AppError } from '@/lib/errors/app-error';
import {
  createQueryFailure,
  createQuerySuccess,
  isQueryFailure,
  isQuerySuccess,
} from '@/server/db';

describe('query result helpers', () => {
  it('creates a success result', () => {
    const result = createQuerySuccess({ id: 'product_1' });

    expect(result).toEqual({
      ok: true,
      data: { id: 'product_1' },
    });
    expect(isQuerySuccess(result)).toBe(true);
    expect(isQueryFailure(result)).toBe(false);
  });

  it('creates a failure result', () => {
    const error = new AppError('Not found', 'NOT_FOUND');
    const result = createQueryFailure(error);

    expect(result).toEqual({
      ok: false,
      error,
    });
    expect(isQueryFailure(result)).toBe(true);
    expect(isQuerySuccess(result)).toBe(false);
  });
});