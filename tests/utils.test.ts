import { parseUrlParams, buildQueryString, parseValue } from '../src/utils';

describe('parseValue', () => {
  test('parses numeric strings as numbers', () => {
    expect(parseValue('42', true, true)).toBe(42);
    expect(parseValue('3.14', true, true)).toBe(3.14);
  });

  test('parses boolean strings as booleans', () => {
    expect(parseValue('true', true, true)).toBe(true);
    expect(parseValue('false', true, true)).toBe(false);
  });

  test('keeps string values as strings', () => {
    expect(parseValue('hello', true, true)).toBe('hello');
  });

  test('respects parseNumbers option', () => {
    expect(parseValue('42', false, true)).toBe('42');
  });

  test('respects parseBooleans option', () => {
    expect(parseValue('true', true, false)).toBe('true');
  });

  test('handles empty values', () => {
    expect(parseValue('', true, true)).toBe('');
    expect(parseValue(null, true, true)).toBe(null);
    expect(parseValue(undefined, true, true)).toBe(undefined);
  });
});

describe('parseUrlParams', () => {
  test('parses simple query string', () => {
    const result = parseUrlParams('?foo=bar&baz=123');
    expect(result).toEqual({ foo: 'bar', baz: 123 });
  });

  test('handles query string with/without leading ?', () => {
    const withQuestion = parseUrlParams('?foo=bar');
    const withoutQuestion = parseUrlParams('foo=bar');
    expect(withQuestion).toEqual(withoutQuestion);
  });

  test('handles empty query string', () => {
    expect(parseUrlParams('')).toEqual({});
    expect(parseUrlParams('?')).toEqual({});
  });

  test('parses array values with comma format', () => {
    const result = parseUrlParams('?tags=red,green,blue', { arrayFormat: 'comma' });
    expect(result).toEqual({ tags: ['red', 'green', 'blue'] });
  });

  test('parses array values with bracket format', () => {
    const result = parseUrlParams('?tags[]=red&tags[]=green&tags[]=blue');
    expect(result).toEqual({ tags: ['red', 'green', 'blue'] });
  });

  test('handles special characters in values', () => {
    const result = parseUrlParams('?query=hello%20world&filter=foo%2Bbar');
    expect(result).toEqual({ query: 'hello world', filter: 'foo+bar' });
  });

  test('parses numbers and booleans in arrays', () => {
    const result = parseUrlParams('?nums=1,2,3&bools=true,false,true', { arrayFormat: 'comma' });
    expect(result).toEqual({
      nums: [1, 2, 3],
      bools: [true, false, true]
    });
  });

  test('handles malformed query strings', () => {
    expect(parseUrlParams('?broken=%3D&invalid=')).toEqual({
      broken: '=',
      invalid: ''
    });
  });
});

describe('buildQueryString', () => {
  test('builds a basic query string from an object', () => {
    const result = buildQueryString({ foo: 'bar', baz: 123 });
    const params = new URLSearchParams(result);
    expect(params.get('foo')).toBe('bar');
    expect(params.get('baz')).toBe('123');
  });

  test('handles empty object', () => {
    expect(buildQueryString({})).toBe('');
  });

  test('skips null and undefined values', () => {
    const result = buildQueryString({ foo: 'bar', baz: null, qux: undefined });
    expect(result).toBe('foo=bar');
  });

  test('handles array values with comma format', () => {
    const result = buildQueryString({ tags: ['red', 'green', 'blue'] }, { arrayFormat: 'comma' });
    const tagsParam = new URLSearchParams(result).get('tags');
    if (tagsParam) {
      const decodedTags = decodeURIComponent(tagsParam).split(',');
      expect(decodedTags).toContain('red');
      expect(decodedTags).toContain('green');
      expect(decodedTags).toContain('blue');
      expect(decodedTags.length).toBe(3);
    } else {
      fail('tags parameter not found');
    }
  });

  test('handles array values with bracket format', () => {
    const result = buildQueryString({ tags: ['red', 'green', 'blue'] }, { arrayFormat: 'bracket' });
    expect(result).toBe('tags%5B%5D=red&tags%5B%5D=green&tags%5B%5D=blue');
  });

  test('handles array values with repeat format', () => {
    const result = buildQueryString({ tags: ['red', 'green', 'blue'] }, { arrayFormat: 'repeat' });
    expect(result).toBe('tags=red&tags=green&tags=blue');
  });

  test('handles empty arrays', () => {
    const result = buildQueryString({ tags: [] });
    expect(result).toBe('');
  });

  test('respects encodeValues option', () => {
    const withEncoding = buildQueryString({ q: 'hello world' }, { encodeValues: true });
    const withoutEncoding = buildQueryString({ q: 'hello world' }, { encodeValues: false });

    const encodedValue = new URLSearchParams(withEncoding).get('q');
    const unencodedValue = new URLSearchParams(withoutEncoding).get('q');

    expect(encodedValue ? decodeURIComponent(encodedValue) : null).toBe('hello world');
    expect(unencodedValue).toBe('hello world');
  });

  test('encodes special characters', () => {
    const result = buildQueryString({ q: 'a+b=c&d' }, { encodeValues: true });
    const param = new URLSearchParams(result).get('q');
    if (param) {
      const decodedParam = decodeURIComponent(param);
      expect(decodedParam).toBe('a+b=c&d');
    } else {
      fail('q parameter not found');
    }
  });

  test('converts non-string values to strings', () => {
    const result = buildQueryString({
      number: 42,
      boolean: true,
      object: { toString: () => 'custom' }
    });

    const params = new URLSearchParams(result);
    expect(params.get('boolean')).toBe('true');
    expect(params.get('number')).toBe('42');
    expect(params.get('object')).toBe('custom');
  });
});