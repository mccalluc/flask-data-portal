import useSWR from 'swr';
import { fetcher } from 'js/helpers/swr';
import { useAppContext } from 'js/components/Contexts';
import { createScFindKey } from './utils';

type CellTypeNamesKey = string;

interface CellTypeNamesResponse {
  cellTypeNames: string[];
}

export function createCellTypeNamesKey(scFindEndpoint: string): CellTypeNamesKey {
  return createScFindKey(scFindEndpoint, 'cellTypeNames', {});
}

export default function useCellTypeNames() {
  const { scFindEndpoint } = useAppContext();
  const key = createCellTypeNamesKey(scFindEndpoint);
  return useSWR<CellTypeNamesResponse, unknown, CellTypeNamesKey>(key, (url) => fetcher({ url }));
}
