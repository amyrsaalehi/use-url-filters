/**
 * Parse a string value into the appropriate type
 * 
 * @param value - The string value to parse
 * @param parseNumbers - Whether to parse numeric strings
 * @param parseBooleans - Whether to parse boolean strings
 * @returns The parsed value
 */
export function parseValue(
  value: string | null | undefined,
  parseNumbers: boolean,
  parseBooleans: boolean
): string | number | boolean | null | undefined {
  if (value === null || value === undefined) return value;

  if (parseBooleans) {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }

  if (parseNumbers && !isNaN(Number(value)) && !isNaN(parseFloat(value))) {
    if (parseInt(value, 10).toString() === value) {
      return parseInt(value, 10);
    }
    return parseFloat(value);
  }

  return value;
}

/**
 * Parse URL search parameters into an object
 * 
 * @param queryString - The query string to parse (with or without '?')
 * @param options - Parsing options
 * @returns Object containing parsed parameters
 */
export function parseUrlParams(
  queryString: string,
  options: {
    arrayFormat?: 'comma' | 'bracket' | 'repeat';
    parseNumbers?: boolean;
    parseBooleans?: boolean;
  } = {}
): Record<string, any> {
  const {
    arrayFormat = 'comma',
    parseNumbers = true,
    parseBooleans = true
  } = options;

  const search = queryString.startsWith('?') ? queryString.substring(1) : queryString;

  if (!search) return {};

  const result: Record<string, any> = {};
  const params = new URLSearchParams(search);

  params.forEach((value, key) => {
    if (arrayFormat === 'comma' && value.includes(',')) {
      result[key] = value.split(',').map(v => parseValue(v, parseNumbers, parseBooleans));
    } else if (key.endsWith('[]')) {
      const cleanKey = key.slice(0, -2);
      if (!result[cleanKey]) {
        result[cleanKey] = [];
      }
      result[cleanKey].push(parseValue(value, parseNumbers, parseBooleans));
    } else {
      result[key] = parseValue(value, parseNumbers, parseBooleans);
    }
  });

  return result;
}

/**
 * Build a query string from an object of filters
 * 
 * @param filters - Object containing filter key-value pairs
 * @param options - Options for building the query string
 * @returns The query string (without leading ?)
 */
export function buildQueryString(
  filters: Record<string, any>,
  options: {
    encodeValues?: boolean;
    arrayFormat?: 'comma' | 'bracket' | 'repeat';
  } = {}
): string {
  const { encodeValues = true, arrayFormat = 'comma' } = options;

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return;
      }

      if (arrayFormat === 'comma') {
        const strValue = value.map(v => v.toString()).join(',');
        params.append(key, encodeValues ? encodeURIComponent(strValue) : strValue);
      } else if (arrayFormat === 'bracket') {
        value.forEach(v => {
          params.append(`${key}[]`, encodeValues ? encodeURIComponent(v.toString()) : v.toString());
        });
      } else if (arrayFormat === 'repeat') {
        value.forEach(v => {
          params.append(key, encodeValues ? encodeURIComponent(v.toString()) : v.toString());
        });
      }
    } else {
      params.append(key, encodeValues ? encodeURIComponent(value.toString()) : value.toString());
    }
  });

  return params.toString();
}