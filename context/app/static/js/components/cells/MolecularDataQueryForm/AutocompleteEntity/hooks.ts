import useSWR from 'swr';
import CellsService from '../../CellsService';
import type { AutocompleteQueryKey, AutocompleteQueryResponse } from './types';

const cellsService = new CellsService();

const cellsServiceFetcher = async ({
  targetEntity,
  substring,
}: AutocompleteQueryKey): Promise<AutocompleteQueryResponse> => {
  if (!substring) {
    return [];
  }
  return cellsService.searchBySubstring({ targetEntity, substring });
};

export function useAutocompleteQuery(queryKey: AutocompleteQueryKey) {
  return useSWR(queryKey, cellsServiceFetcher);
}
