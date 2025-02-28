import useSWR from 'swr';
import { fetcher } from 'js/helpers/swr';
import { useAppContext } from 'js/components/Contexts';
import { createScFindKey } from './utils';

export interface FindGeneSignaturesParams {
  cellTypes?: string | string[];
  minCells?: number;
  minFraction?: number;
}

type FindGeneSignaturesKey = string;

interface FindGeneSignaturesResponse {
  evaluateMarkers: unknown;
}

export function createFindGeneSignaturesKey(
  scFindEndpoint: string,
  { cellTypes, minCells, minFraction }: FindGeneSignaturesParams,
): FindGeneSignaturesKey {
  return createScFindKey(scFindEndpoint, 'findGeneSignatures', {
    cell_types: Array.isArray(cellTypes) ? cellTypes.join(',') : cellTypes,
    min_cells: minCells ? String(minCells) : undefined,
    min_fraction: minFraction ? String(minFraction) : undefined,
  });
}

export default function useFindGeneSignatures(params: FindGeneSignaturesParams) {
  const { scFindEndpoint } = useAppContext();
  const key = createFindGeneSignaturesKey(scFindEndpoint, params);
  return useSWR<FindGeneSignaturesResponse, unknown, FindGeneSignaturesKey>(key, (url) => fetcher({ url }));
}
