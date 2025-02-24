import { QueryType } from '../../queryTypes';

export interface AutocompleteQueryKey {
  targetEntity: QueryType;
  substring: string;
}

export interface AutocompleteResult {
  match: string;
  full: string;
  pre: string;
  post: string;
}

export type AutocompleteQueryResponse = AutocompleteResult[];
