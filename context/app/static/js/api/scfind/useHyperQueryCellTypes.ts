import useSWR from 'swr';
import { fetcher } from 'js/helpers/swr';
import { createScfindKey } from './utils';

export interface HyperQueryCellTypesParams {
  geneList: string | string[];
  datasetName: string | string[];
  includePrefix: boolean;
}

interface CellTypeNamesResponse {
  cellTypeNames: string[];
}

type HyperQueryCellTypesKey = string;

export function createCellTypeNamesKey({ geneList, includePrefix }: HyperQueryCellTypesParams): HyperQueryCellTypesKey {
  return createScfindKey('hyperQueryCellTypes', {
    gene_list: Array.isArray(geneList) ? geneList.join(',') : geneList,
    include_prefix: includePrefix ? 'true' : 'false',
  });
}

export default function useHyperQueryCellTypes(params: HyperQueryCellTypesParams) {
  const key = createCellTypeNamesKey(params);
  return useSWR<CellTypeNamesResponse, unknown, HyperQueryCellTypesKey>(key, (url) => fetcher({ url }));
}
