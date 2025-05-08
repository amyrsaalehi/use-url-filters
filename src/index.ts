import { useState, useEffect, useCallback } from 'react';
import { parseUrlParams, buildQueryString } from './utils';

/**
 * Options for useUrlFilters hook
 */
export interface UseUrlFiltersOptions {
  /** Whether to use replaceState instead of pushState (default: false) */
  replaceState?: boolean;
  /** Whether to encode parameter values (default: true) */
  encodeValues?: boolean;
  /** Format for arrays: 'comma', 'bracket', or 'repeat' (default: 'comma') */
  arrayFormat?: 'comma' | 'bracket' | 'repeat';
  /** Whether to parse numeric strings as numbers (default: true) */
  parseNumbers?: boolean;
  /** Whether to parse "true"/"false" strings as booleans (default: true) */
  parseBooleans?: boolean;
  /** Callback when filters change (params: newFilters) */
  onFilterChange?: (filters: Record<string, any>) => void;
}

/**
 * Return type for useUrlFilters hook
 */
export interface UseUrlFiltersReturn {
  /** Current filter values */
  filters: Record<string, any>;
  /** Function to set an individual filter */
  setFilter: (key: string, value: any) => void;
  /** Function to set multiple filters at once */
  setFilters: (newFilters: Record<string, any>) => void;
  /** Function to remove a filter */
  removeFilter: (key: string) => void;
  /** Function to clear all filters */
  clearFilters: () => void;
  /** Boolean indicating if any filters are set */
  hasFilters: boolean;
  /** Number of active filters */
  filterCount: number;
}

/**
 * useUrlFilters - A React hook for managing URL search parameters
 * 
 * @param initialFilters - Initial filter values (default: {})
 * @param options - Configuration options
 * @returns Hook API object
 */
function useUrlFilters(
  initialFilters: Record<string, any> = {},
  options: UseUrlFiltersOptions = {}
): UseUrlFiltersReturn {
  const {
    replaceState = false,
    encodeValues = true,
    arrayFormat = 'comma',
    parseNumbers = true,
    parseBooleans = true,
    onFilterChange = null,
  } = options;

  const [filters, setFiltersState] = useState<Record<string, any>>(() => {
    if (typeof window !== 'undefined') {
      const urlFilters = parseUrlParams(window.location.search, {
        arrayFormat,
        parseNumbers,
        parseBooleans
      });
      return { ...initialFilters, ...urlFilters };
    }

    return initialFilters;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const queryString = buildQueryString(filters, { encodeValues, arrayFormat });
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;

    try {
      if (replaceState) {
        window.history.replaceState(null, '', newUrl);
      } else {
        window.history.pushState(null, '', newUrl);
      }

      if (onFilterChange && typeof onFilterChange === 'function') {
        onFilterChange(filters);
      }
    } catch (e) {
      console.error('Error updating URL:', e);
    }
  }, [filters, replaceState, encodeValues, arrayFormat, onFilterChange]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const urlFilters = parseUrlParams(window.location.search, {
        arrayFormat,
        parseNumbers,
        parseBooleans
      });
      setFiltersState(urlFilters);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [arrayFormat, parseNumbers, parseBooleans]);

  const setFilter = useCallback((key: string, value: any) => {
    setFiltersState(prevFilters => ({
      ...prevFilters,
      [key]: value
    }));
  }, []);

  const setFilters = useCallback((newFilters: Record<string, any>) => {
    setFiltersState(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFiltersState(prevFilters => {
      const newFilters = { ...prevFilters };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  const filterCount = Object.keys(filters).length;
  const hasFilters = filterCount > 0;

  return {
    filters,
    setFilter,
    setFilters,
    removeFilter,
    clearFilters,
    hasFilters,
    filterCount
  };
}

export { parseUrlParams, buildQueryString };
export default useUrlFilters;