import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import useUrlFilters from '../src';

const mockPushState = jest.fn();
const mockReplaceState = jest.fn();

function TestComponent({
  initialFilters = {},
  options = {},
}: {
  initialFilters?: Record<string, any>;
  options?: Parameters<typeof useUrlFilters>[1];
}) {
  const { filters, setFilter, setFilters, removeFilter, clearFilters, hasFilters, filterCount } =
    useUrlFilters(initialFilters, options);

  return (
    <div>
      <div data-testid="filters">{JSON.stringify(filters)}</div>
      <div data-testid="hasFilters">{hasFilters.toString()}</div>
      <div data-testid="filterCount">{filterCount}</div>
      <button data-testid="setCategory" onClick={() => setFilter('category', 'electronics')}>
        Set Category
      </button>
      <button data-testid="setPrice" onClick={() => setFilter('price', 100)}>
        Set Price
      </button>
      <button data-testid="setBoolFilter" onClick={() => setFilter('inStock', true)}>
        Set Boolean Filter
      </button>
      <button data-testid="setMultipleFilters" onClick={() => setFilters({ sort: 'asc', page: 1 })}>
        Set Multiple Filters
      </button>
      <button data-testid="removeFilter" onClick={() => removeFilter('category')}>
        Remove Category
      </button>
      <button data-testid="clearFilters" onClick={clearFilters}>
        Clear Filters
      </button>
    </div>
  );
}

describe('useUrlFilters', () => {
  beforeEach(() => {
    const originalLocationHref = window.location.href;
    const originalLocationPathname = window.location.pathname;
    const originalLocationSearch = window.location.search;

    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: 'http://localhost/',
        pathname: '/',
        search: '',
        assign: jest.fn(),
        replace: jest.fn(),
        reload: jest.fn(),
        toString: jest.fn(() => window.location.href),
      },
    });

    Object.defineProperty(window, 'history', {
      writable: true,
      value: {
        pushState: mockPushState,
        replaceState: mockReplaceState,
        back: jest.fn(),
        forward: jest.fn(),
        go: jest.fn(),
        state: null,
      },
    });

    mockPushState.mockClear();
    mockReplaceState.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('initializes with empty filters when no URL params or defaults', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('filters')).toHaveTextContent('{}');
    expect(screen.getByTestId('hasFilters')).toHaveTextContent('false');
    expect(screen.getByTestId('filterCount')).toHaveTextContent('0');
  });

  test('initializes with default filters', () => {
    const initialFilters = { category: 'all', page: 1 };
    render(<TestComponent initialFilters={initialFilters} />);
    expect(screen.getByTestId('filters')).toHaveTextContent(JSON.stringify(initialFilters));
    expect(screen.getByTestId('hasFilters')).toHaveTextContent('true');
    expect(screen.getByTestId('filterCount')).toHaveTextContent('2');
  });

  test('initializes with URL params', () => {
    window.location.search = '?category=clothing&price=50';
    render(<TestComponent />);
    expect(screen.getByTestId('filters')).toHaveTextContent('"category":"clothing","price":50');
    expect(screen.getByTestId('hasFilters')).toHaveTextContent('true');
    expect(screen.getByTestId('filterCount')).toHaveTextContent('2');
  });

  test('URL params override default filters', () => {
    window.location.search = '?category=clothing';
    const initialFilters = { category: 'all', page: 1 };
    render(<TestComponent initialFilters={initialFilters} />);
    expect(screen.getByTestId('filters')).toHaveTextContent('"category":"clothing","page":1');
  });

  test('setFilter updates a single filter and updates URL', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('filters')).toHaveTextContent('{}');
    fireEvent.click(screen.getByTestId('setCategory'));
    expect(screen.getByTestId('filters')).toHaveTextContent('"category":"electronics"');
    expect(screen.getByTestId('hasFilters')).toHaveTextContent('true');
    expect(screen.getByTestId('filterCount')).toHaveTextContent('1');
    expect(mockPushState).toHaveBeenCalledWith(null, '', '/?category=electronics');
  });

  test('setFilter with number value', () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByTestId('setPrice'));
    expect(screen.getByTestId('filters')).toHaveTextContent('"price":100');
    expect(mockPushState).toHaveBeenCalledWith(null, '', '/?price=100');
  });

  test('setFilter with boolean value', () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByTestId('setBoolFilter'));
    expect(screen.getByTestId('filters')).toHaveTextContent('"inStock":true');
    expect(mockPushState).toHaveBeenCalledWith(null, '', '/?inStock=true');
  });

  test('setFilters updates multiple filters at once', () => {
    render(<TestComponent initialFilters={{ category: 'all' }} />);
    expect(screen.getByTestId('filters')).toHaveTextContent('"category":"all"');
    fireEvent.click(screen.getByTestId('setMultipleFilters'));
    expect(screen.getByTestId('filters')).toHaveTextContent(
      '"category":"all","sort":"asc","page":1'
    );
    expect(screen.getByTestId('filterCount')).toHaveTextContent('3');
    expect(mockPushState).toHaveBeenCalled();
    const lastCallUrl = mockPushState.mock.calls[mockPushState.mock.calls.length - 1][2];
    const params = new URLSearchParams(lastCallUrl.substring(lastCallUrl.indexOf('?')));
    expect(params.get('category')).toBe('all');
    expect(params.get('page')).toBe('1');
    expect(params.get('sort')).toBe('asc');
  });

  test('removeFilter removes a specific filter', () => {
    render(<TestComponent initialFilters={{ category: 'all', page: 1 }} />);
    expect(screen.getByTestId('filters')).toHaveTextContent('"category":"all","page":1');
    fireEvent.click(screen.getByTestId('removeFilter'));
    expect(screen.getByTestId('filters')).toHaveTextContent('"page":1');
    expect(screen.getByTestId('filterCount')).toHaveTextContent('1');
    expect(mockPushState).toHaveBeenCalledWith(null, '', '/?page=1');
  });

  test('clearFilters removes all filters', () => {
    render(<TestComponent initialFilters={{ category: 'all', page: 1, sort: 'asc' }} />);
    expect(screen.getByTestId('filters')).toHaveTextContent(
      '"category":"all","page":1,"sort":"asc"'
    );
    fireEvent.click(screen.getByTestId('clearFilters'));
    expect(screen.getByTestId('filters')).toHaveTextContent('{}');
    expect(screen.getByTestId('hasFilters')).toHaveTextContent('false');
    expect(screen.getByTestId('filterCount')).toHaveTextContent('0');
    expect(mockPushState).toHaveBeenCalledWith(null, '', '/');
  });

  test('uses replaceState instead of pushState when option is set', () => {
    render(<TestComponent options={{ replaceState: true }} />);
    fireEvent.click(screen.getByTestId('setCategory'));
    expect(mockPushState).not.toHaveBeenCalled();
    expect(mockReplaceState).toHaveBeenCalledWith(null, '', '/?category=electronics');
  });

  test('handles popstate event', () => {
    render(<TestComponent initialFilters={{ category: 'all' }} />);
    act(() => {
      const popStateEvent = new Event('popstate');
      window.location.search = '?sort=desc&page=2';
      window.dispatchEvent(popStateEvent);
    });
    expect(screen.getByTestId('filters')).toHaveTextContent('"sort":"desc","page":2');
  });

  test('calls onFilterChange callback when filters change', () => {
    const onFilterChange = jest.fn();
    render(<TestComponent options={{ onFilterChange }} />);
    fireEvent.click(screen.getByTestId('setCategory'));
    expect(onFilterChange).toHaveBeenCalledWith({ category: 'electronics' });
  });

  test('handles errors gracefully when history API is not available', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    window.history.pushState = jest.fn().mockImplementation(() => {
      throw new Error('History API not available');
    });
    render(<TestComponent />);
    expect(() => {
      fireEvent.click(screen.getByTestId('setCategory'));
    }).not.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
