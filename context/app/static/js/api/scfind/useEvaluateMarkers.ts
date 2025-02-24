import useSWR from 'swr';
import { fetcher } from 'js/helpers/swr';
import { createScfindKey } from './utils';

export interface EvaluateMarkersParams {
  geneList: string | string[];
  cellTypes: string | string[];
  backgroundCellTypes?: string[];
  sortField?: string;
  includePrefix?: boolean;
}

type EvaluateMarkersKey = string;

interface EvaluateMarkersResponse {
  evaluateMarkers: unknown;
}

export function createCellTypeMarkersKey({
  geneList,
  cellTypes,
  backgroundCellTypes,
  sortField,
  includePrefix,
}: EvaluateMarkersParams): EvaluateMarkersKey {
  return createScfindKey('evaluateMarkers', {
    gene_list: Array.isArray(geneList) ? geneList.join(',') : geneList,
    cell_types: Array.isArray(cellTypes) ? cellTypes.join(',') : cellTypes,
    background_cell_types: Array.isArray(backgroundCellTypes) ? backgroundCellTypes.join(',') : backgroundCellTypes,
    sort_field: sortField,
    include_prefix: includePrefix !== undefined ? String(includePrefix) : undefined,
  });
}

export default function useEvaluateMarkers(params: EvaluateMarkersParams) {
  const key = createCellTypeMarkersKey(params);
  return useSWR<EvaluateMarkersResponse, unknown, EvaluateMarkersKey>(key, (url) => fetcher({ url }));
}
