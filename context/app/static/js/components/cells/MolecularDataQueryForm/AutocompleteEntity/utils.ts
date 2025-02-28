import { AutocompleteQueryResponse } from './types';

export function stringToAutocompleteObject(
  str?: string,
  match: string | undefined = str,
): AutocompleteQueryResponse[number] | null {
  if (!str) {
    return null;
  }
  if (!match) {
    return null;
  }
  const matchIndex = str.toLowerCase().indexOf(match.toLowerCase());
  const pre = str.slice(0, matchIndex);
  const post = str.slice(matchIndex + match.length);
  return { full: str, pre, match, post };
}

/**
 * Creates an autocomplete object and wraps it in a list if a string is passed.
 * Else returns an empty list
 * @param str The default/initial value for the autocomplete, if any
 * @returns A list of autocomplete objects
 */
export function createInitialValue(str?: string): AutocompleteQueryResponse {
  return str ? ([stringToAutocompleteObject(str)].filter(Boolean) as AutocompleteQueryResponse) : [];
}
