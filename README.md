# use-url-filters

A lightweight, framework-agnostic React hook for managing URL search parameters in client-side applications. Perfect for filtering, sorting, and pagination that persists through page refreshes and can be shared via URL.

[![npm version](https://img.shields.io/npm/v/use-url-filters.svg)](https://www.npmjs.com/package/use-url-filters)
[![Downloads](https://img.shields.io/npm/dm/use-url-filters.svg)](https://www.npmjs.com/package/use-url-filters)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/use-url-filters)](https://bundlephobia.com/package/use-url-filters)

## Features

- 🔍 **URL-synchronized filters** - Filter state is automatically synchronized with the URL
- 🔗 **Shareable URLs** - Users can share filtered views via URL
- 🧠 **Type Parsing** - Automatically parses numbers and booleans from URL parameters
- 📦 **Framework Agnostic** - Works with any React setup (Next.js, CRA, Vite, etc.)
- 🚫 **No Dependencies** - Uses only the native browser APIs (Window, URLSearchParams)
- 🧩 **Array Support** - Multiple formats for handling array values in URLs
- 📜 **History Integration** - Browser back/forward navigation works with your filters
- 💾 **Default Values** - Set default filters that apply when none are in the URL

## Installation

```bash
# npm
npm install use-url-filters

# yarn
yarn add use-url-filters

# pnpm
pnpm add use-url-filters
```

## Quick Start

```jsx
import useUrlFilters from "use-url-filters";

function ProductList() {
  const { filters, setFilter, clearFilters } = useUrlFilters({
    category: "all", // Default values
    minPrice: 0,
  });

  // URL will automatically update when filters change
  return (
    <div>
      <select
        value={filters.category}
        onChange={(e) => setFilter("category", e.target.value)}
      >
        <option value="all">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>

      <input
        type="range"
        value={filters.minPrice || 0}
        onChange={(e) => setFilter("minPrice", Number(e.target.value))}
      />

      <button onClick={clearFilters}>Reset Filters</button>
    </div>
  );
}
```

## API

### `useUrlFilters(initialFilters?, options?)`

The main hook that manages URL filters.

#### Parameters

- `initialFilters` (object, optional): Default filters to use if none are in the URL
- `options` (object, optional): Configuration options:
  - `replaceState` (boolean): Use `replaceState` instead of `pushState` (default: `false`)
  - `encodeValues` (boolean): URI encode parameter values (default: `true`)
  - `arrayFormat` (string): Format for arrays: `'comma'`, `'bracket'`, or `'repeat'` (default: `'comma'`)
  - `parseNumbers` (boolean): Parse numeric strings as numbers (default: `true`)
  - `parseBooleans` (boolean): Parse "true"/"false" strings as booleans (default: `true`)
  - `onFilterChange` (function): Callback when filters change (params: newFilters)

#### Returns

Object with the following properties:

- `filters` (object): Current filter values
- `setFilter(key, value)` (function): Set an individual filter
- `setFilters(filtersObject)` (function): Set multiple filters at once
- `removeFilter(key)` (function): Remove a filter
- `clearFilters()` (function): Clear all filters
- `hasFilters` (boolean): Whether any filters are set
- `filterCount` (number): Number of active filters

## Examples

### E-commerce Product Filtering

```jsx
function ProductFilters() {
  const { filters, setFilter, clearFilters } = useUrlFilters({
    query: "",
    category: "all",
    minPrice: 0,
    maxPrice: 1000,
    inStock: true,
    sort: "popularity",
  });

  // Component implementation...
}
```

### Data Table with Sorting, Filtering and Pagination

```jsx
function DataTable() {
  const { filters, setFilter, setFilters } = useUrlFilters({
    page: 1,
    limit: 25,
    sortBy: "createdAt",
    sortDir: "desc",
    search: "",
  });

  // Handle pagination
  const goToPage = (page) => {
    setFilter("page", page);
  };

  // Handle column sorting
  const handleSort = (column) => {
    setFilters({
      sortBy: column,
      sortDir:
        filters.sortBy === column && filters.sortDir === "asc" ? "desc" : "asc",
    });
  };

  // Component implementation...
}
```

## Advanced Usage

### Multiple Array Formats

```jsx
// Default comma-separated: ?colors=red,green,blue
const { filters } = useUrlFilters({}, { arrayFormat: "comma" });

// Bracket notation: ?colors[]=red&colors[]=green&colors[]=blue
const { filters } = useUrlFilters({}, { arrayFormat: "bracket" });

// Repeated keys: ?colors=red&colors=green&colors=blue
const { filters } = useUrlFilters({}, { arrayFormat: "repeat" });
```

### Custom Type Handling

```jsx
// Disable automatic type conversion
const { filters } = useUrlFilters(
  {},
  {
    parseNumbers: false,
    parseBooleans: false,
  }
);

// Manual type conversion
const minPrice = filters.minPrice ? Number(filters.minPrice) : 0;
const isActive = filters.active === "true";
```

### Integration with Data Fetching

```jsx
function ProductList() {
  const { filters } = useUrlFilters({ category: "all", page: 1 });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/products?${new URLSearchParams(filters)}`
        );
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  // Component implementation...
}
```

## Browser Compatibility

`use-url-filters` is compatible with all modern browsers that support:

- `URLSearchParams`
- `window.history.pushState`/`replaceState`
- `Array.prototype.forEach`

For older browsers, consider using a polyfill for `URLSearchParams`.

## License

MIT
