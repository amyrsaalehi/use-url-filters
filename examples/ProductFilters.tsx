import React, { useEffect, useState } from 'react';
import useUrlFilters from '../src';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
}

const mockProducts: Product[] = [
  { id: 1, name: 'Phone', category: 'electronics', price: 699, inStock: true },
  { id: 2, name: 'Laptop', category: 'electronics', price: 1299, inStock: true },
  { id: 3, name: 'T-shirt', category: 'clothing', price: 29, inStock: true },
  { id: 4, name: 'Jeans', category: 'clothing', price: 79, inStock: false },
  { id: 5, name: 'Plant', category: 'home', price: 39, inStock: true },
  { id: 6, name: 'Coffee Table', category: 'home', price: 199, inStock: false },
];

const ProductFilters: React.FC = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);

  const { filters, setFilter, setFilters, removeFilter, clearFilters, hasFilters, filterCount } =
    useUrlFilters(
      {
        category: 'all',
        minPrice: 0,
        maxPrice: 1500,
        inStock: false,
      },
      {
        replaceState: false,
        onFilterChange: newFilters => {
          console.log('Filters changed:', newFilters);
        },
      }
    );

  useEffect(() => {
    let result = [...mockProducts];

    if (filters.category && filters.category !== 'all') {
      result = result.filter(product => product.category === filters.category);
    }

    if (filters.minPrice !== undefined) {
      result = result.filter(product => product.price >= filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter(product => product.price <= filters.maxPrice);
    }

    if (filters.inStock === true) {
      result = result.filter(product => product.inStock === true);
    }

    setFilteredProducts(result);
  }, [filters]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter('category', e.target.value);
  };

  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'minPrice' | 'maxPrice'
  ) => {
    setFilter(type, parseInt(e.target.value, 10));
  };

  const handleInStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter('inStock', e.target.checked);
  };

  const handleApplyExampleFilters = () => {
    setFilters({
      category: 'electronics',
      minPrice: 500,
      inStock: true,
    });
  };

  return (
    <div className="product-filters-example">
      <h2>Product Filters Example</h2>

      <div className="filters-container">
        <div className="filter-summary">
          <h3>Active filters: {filterCount}</h3>
          <div className="filter-buttons">
            {hasFilters && <button onClick={clearFilters}>Clear all filters</button>}
            <button onClick={handleApplyExampleFilters}>Apply Example Filters</button>
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="category">Category:</label>
            <select id="category" value={filters.category || 'all'} onChange={handleCategoryChange}>
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home & Garden</option>
            </select>
            <button onClick={() => removeFilter('category')} disabled={!('category' in filters)}>
              Reset
            </button>
          </div>

          <div className="filter-group">
            <label htmlFor="minPrice">Min Price: ${filters.minPrice || 0}</label>
            <input
              type="range"
              id="minPrice"
              min="0"
              max="1500"
              value={filters.minPrice || 0}
              onChange={e => handlePriceChange(e, 'minPrice')}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="maxPrice">Max Price: ${filters.maxPrice || 1500}</label>
            <input
              type="range"
              id="maxPrice"
              min="0"
              max="1500"
              value={filters.maxPrice || 1500}
              onChange={e => handlePriceChange(e, 'maxPrice')}
            />
          </div>

          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={filters.inStock === true}
                onChange={handleInStockChange}
              />
              In Stock Only
            </label>
          </div>
        </div>
      </div>

      <div className="products-list">
        <h3>Products ({filteredProducts.length})</h3>
        {filteredProducts.length === 0 ? (
          <p>No products match your filters.</p>
        ) : (
          <ul>
            {filteredProducts.map(product => (
              <li key={product.id}>
                <strong>{product.name}</strong> - ${product.price} -{product.category} -
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="filter-debug">
        <h4>Current URL Filters:</h4>
        <pre>{JSON.stringify(filters, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ProductFilters;
