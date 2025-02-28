import useSWR from 'swr';
import { fetcher } from 'js/helpers/swr';
import { useAppContext } from 'js/components/Contexts';
import { createScFindKey } from './utils';

export interface FindCellTypeSpecificitiesParams {
  geneList?: string | string[];
  datasets?: string | string[];
  minCells?: number;
  minFraction?: number;
}

type EvaluateMarkersKey = string;

interface FindCellTypeSpecificitiesResponse {
  evaluateMarkers: unknown;
}

export function createCellTypeSpecificitiesKey(
  scFindEndpoint: string,
  { geneList, datasets, minCells, minFraction }: FindCellTypeSpecificitiesParams,
): EvaluateMarkersKey {
  return createScFindKey(scFindEndpoint, 'findCellTypeSpecificities', {
    gene_list: Array.isArray(geneList) ? geneList.join(',') : geneList,
    datasets: Array.isArray(datasets) ? datasets.join(',') : datasets,
    min_cells: minCells ? String(minCells) : undefined,
    min_fraction: minFraction ? String(minFraction) : undefined,
  });
}

export default function useFindCellTypeSpecificities(params: FindCellTypeSpecificitiesParams) {
  const { scFindEndpoint } = useAppContext();
  const key = createCellTypeSpecificitiesKey(scFindEndpoint, params);
  return useSWR<FindCellTypeSpecificitiesResponse, unknown, EvaluateMarkersKey>(key, (url) => fetcher({ url }));
}
