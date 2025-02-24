import useSWR from 'swr';
import { fetcher } from 'js/helpers/swr';
import { createScfindKey } from './utils';

export interface FindHouseKeepingGenesParams {
  cellTypes?: string | string[];
  minRecall?: number;
  maxGenes?: number;
}

type FindHouseKeepingGenesKey = string;

interface FindHouseKeepingGenesResponse {
  findHouseKeepingGenes: unknown;
}

export function createFindHouseKeepingGenesKey({
  cellTypes,
  minRecall,
  maxGenes,
}: FindHouseKeepingGenesParams): FindHouseKeepingGenesKey {
  return createScfindKey('findHouseKeepingGenes', {
    cell_types: Array.isArray(cellTypes) ? cellTypes.join(',') : cellTypes,
    min_recall: minRecall ? String(minRecall) : undefined,
    max_genes: maxGenes ? String(maxGenes) : undefined,
  });
}

export default function useFindHouseKeepingGenes(params: FindHouseKeepingGenesParams) {
  const key = createFindHouseKeepingGenesKey(params);
  return useSWR<FindHouseKeepingGenesResponse, unknown, FindHouseKeepingGenesKey>(key, (url) => fetcher({ url }));
}
