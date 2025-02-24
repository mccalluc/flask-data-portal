import useSWR from 'swr';
import { fetcher } from 'js/helpers/swr';
import { createScfindKey } from './utils';

type CellTypeNamesKey = string;

interface CellTypeNamesResponse {
  cellTypeNames: string[];
}

export function createCellTypeNamesKey(): CellTypeNamesKey {
  return createScfindKey('cellTypeNames', {});
}

export default function useCellTypeNames() {
  const key = createCellTypeNamesKey();
  return useSWR<CellTypeNamesResponse, unknown, CellTypeNamesKey>(key, (url) => fetcher({ url }));
}
