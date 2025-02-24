import useSWR from 'swr';
import { fetcher } from 'js/helpers/swr';
import { createScfindKey } from './utils';

export interface FindTissueSpecificitiesParams {
  geneList?: string | string[];
  minCells?: number;
}

type FindTissueSpecificitiesKey = string;

interface FindTissueSpecificitiesResponse {
  evaluateMarkers: unknown;
}

export function FindTissueSpecificitiesKey({
  geneList,
  minCells,
}: FindTissueSpecificitiesParams): FindTissueSpecificitiesKey {
  return createScfindKey('findTissueSpecificities', {
    gene_list: Array.isArray(geneList) ? geneList.join(',') : geneList,
    min_cells: minCells ? String(minCells) : undefined,
  });
}

export default function useFindTissueSpecificities(params: FindTissueSpecificitiesParams) {
  const key = FindTissueSpecificitiesKey(params);
  return useSWR<FindTissueSpecificitiesResponse, unknown, FindTissueSpecificitiesKey>(key, (url) => fetcher({ url }));
}
