import { AppError } from '@/lib/errors/app-error';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;

type PaginationValue = number | string | null | undefined;

export type PaginationInput = {
  page?: PaginationValue;
  pageSize?: PaginationValue;
};

export type PaginationConfig = {
  defaultPage?: number;
  defaultPageSize?: number;
  maxPageSize?: number;
};

export type Pagination = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

export type PaginationMeta = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};

function parsePositiveInteger(value: PaginationValue, fallback: number, fieldName: string): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsedValue = typeof value === 'string' ? Number.parseInt(value, 10) : value;

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new AppError(`Invalid ${fieldName} value`, 'INVALID_PAGINATION', {
      statusCode: 400,
      userMessage: `${fieldName} must be a positive integer.`,
    });
  }

  return parsedValue;
}

export function normalizePagination(
  input: PaginationInput = {},
  config: PaginationConfig = {},
): Pagination {
  const defaultPage = config.defaultPage ?? DEFAULT_PAGE;
  const defaultPageSize = config.defaultPageSize ?? DEFAULT_PAGE_SIZE;
  const maxPageSize = config.maxPageSize ?? MAX_PAGE_SIZE;

  const page = parsePositiveInteger(input.page, defaultPage, 'page');
  const requestedPageSize = parsePositiveInteger(input.pageSize, defaultPageSize, 'pageSize');
  const pageSize = Math.min(requestedPageSize, maxPageSize);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function createPaginationMeta(totalItems: number, pagination: Pick<Pagination, 'page' | 'pageSize'>): PaginationMeta {
  if (!Number.isInteger(totalItems) || totalItems < 0) {
    throw new AppError('Invalid totalItems value', 'INVALID_PAGINATION_TOTAL', {
      statusCode: 500,
      userMessage: 'The requested list could not be paginated.',
    });
  }

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pagination.pageSize);

  return {
    currentPage: pagination.page,
    pageSize: pagination.pageSize,
    totalItems,
    totalPages,
    hasNextPage: totalPages > 0 && pagination.page < totalPages,
    hasPreviousPage: pagination.page > 1,
  };
}

export function createPaginatedResult<T>(options: {
  items: T[];
  totalItems: number;
  pagination: Pick<Pagination, 'page' | 'pageSize'>;
}): PaginatedResult<T> {
  return {
    items: options.items,
    meta: createPaginationMeta(options.totalItems, options.pagination),
  };
}