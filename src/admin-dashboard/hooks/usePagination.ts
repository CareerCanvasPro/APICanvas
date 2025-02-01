import { useState, useCallback } from 'react';
import { PaginatedResponse } from '../types/api.types';

interface UsePaginationProps<T> {
  fetchFunction: (params: { page: number; limit: number }) => Promise<PaginatedResponse<T>>;
  initialLimit?: number;
}

export function usePagination<T>({ 
  fetchFunction, 
  initialLimit = 10 
}: UsePaginationProps<T>) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<PaginatedResponse<T> | null>(null);

  const fetchPage = useCallback(async (newPage?: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchFunction({ 
        page: newPage || page, 
        limit 
      });
      setData(response);
      if (newPage) setPage(newPage);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, fetchFunction]);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    fetchPage(1);
  }, [fetchPage]);

  return {
    page,
    limit,
    loading,
    error,
    data,
    fetchPage,
    changeLimit,
    setPage
  };
}