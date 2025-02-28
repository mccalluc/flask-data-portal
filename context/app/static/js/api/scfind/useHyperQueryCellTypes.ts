import useSWR from 'swr';
import { fetcher } from 'js/helpers/swr';
import { useAppContext } from 'js/components/Contexts';
import { createScFindKey } from './utils';

export interface HyperQueryCellTypesParams {
  geneList: string | string[];
  datasetName: string | string[];
  includePrefix: boolean;
}

interface CellTypeNamesResponse {
  cellTypeNames: string[];
}

type HyperQueryCellTypesKey = string;

export function createCellTypeNamesKey(
  scFindEndpoint: string,
  { geneList, includePrefix }: HyperQueryCellTypesParams,
): HyperQueryCellTypesKey {
  return createScFindKey(scFindEndpoint, 'hyperQueryCellTypes', {
    gene_list: Array.isArray(geneList) ? geneList.join(',') : geneList,
    include_prefix: includePrefix ? 'true' : 'false',
  });
}

export default function useHyperQueryCellTypes(params: HyperQueryCellTypesParams) {
  const { scFindEndpoint } = useAppContext();
  const key = createCellTypeNamesKey(scFindEndpoint, params);
  return useSWR<CellTypeNamesResponse, unknown, HyperQueryCellTypesKey>(key, (url) => fetcher({ url }));
}
