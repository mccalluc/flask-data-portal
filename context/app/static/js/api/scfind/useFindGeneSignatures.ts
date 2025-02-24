import useSWR from 'swr';
import { fetcher } from 'js/helpers/swr';
import { createScfindKey } from './utils';

export interface FindGeneSignaturesParams {
  cellTypes?: string | string[];
  minCells?: number;
  minFraction?: number;
}

type FindGeneSignaturesKey = string;

interface FindGeneSignaturesResponse {
  evaluateMarkers: unknown;
}

export function createFindGeneSignaturesKey({
  cellTypes,
  minCells,
  minFraction,
}: FindGeneSignaturesParams): FindGeneSignaturesKey {
  return createScfindKey('findGeneSignatures', {
    cell_types: Array.isArray(cellTypes) ? cellTypes.join(',') : cellTypes,
    min_cells: minCells ? String(minCells) : undefined,
    min_fraction: minFraction ? String(minFraction) : undefined,
  });
}

export default function useFindGeneSignatures(params: FindGeneSignaturesParams) {
  const key = createFindGeneSignaturesKey(params);
  return useSWR<FindGeneSignaturesResponse, unknown, FindGeneSignaturesKey>(key, (url) => fetcher({ url }));
}
