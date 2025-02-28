import { createInitialValue, stringToAutocompleteObject } from './utils';

describe('stringToAutocompleteObject', () => {
  it('should return null if str is undefined', () => {
    expect(stringToAutocompleteObject(undefined)).toBeNull();
  });
  it('should not return null if match is not provided but str is', () => {
    const result = stringToAutocompleteObject('foo');
    expect(result).not.toBeNull();
    expect(result).toEqual({ full: 'foo', pre: '', match: 'foo', post: '' });
  });
  it('should properly split the string into pre, match, and post', () => {
    const result = stringToAutocompleteObject('foobarbaz', 'bar');
    expect(result).toEqual({ full: 'foobarbaz', pre: 'foo', match: 'bar', post: 'baz' });
  });
});

describe('createInitialValue', () => {
  it('should return an empty list if str is undefined', () => {
    expect(createInitialValue(undefined)).toEqual([]);
  });
  it('should return an empty list if str is an empty string', () => {
    expect(createInitialValue('')).toEqual([]);
  });
  it('should return a list with one element if str is provided', () => {
    expect(createInitialValue('foo')).toEqual([{ full: 'foo', pre: '', match: 'foo', post: '' }]);
  });
});
