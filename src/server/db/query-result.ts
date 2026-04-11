import type { AppError } from '@/lib/errors/app-error';
import type { PaginatedResult } from '@/server/db/pagination';

export type QuerySuccess<T> = {
  ok: true;
  data: T;
};

export type QueryFailure<ErrorType extends Error = AppError> = {
  ok: false;
  error: ErrorType;
};

export type QueryResult<T, ErrorType extends Error = AppError> =
  | QuerySuccess<T>
  | QueryFailure<ErrorType>;

export type PaginatedQueryResult<T, ErrorType extends Error = AppError> = QueryResult<
  PaginatedResult<T>,
  ErrorType
>;

export function createQuerySuccess<T>(data: T): QuerySuccess<T> {
  return {
    ok: true,
    data,
  };
}

export function createQueryFailure<ErrorType extends Error>(error: ErrorType): QueryFailure<ErrorType> {
  return {
    ok: false,
    error,
  };
}

export function isQuerySuccess<T, ErrorType extends Error>(
  result: QueryResult<T, ErrorType>,
): result is QuerySuccess<T> {
  return result.ok;
}

export function isQueryFailure<T, ErrorType extends Error>(
  result: QueryResult<T, ErrorType>,
): result is QueryFailure<ErrorType> {
  return !result.ok;
}