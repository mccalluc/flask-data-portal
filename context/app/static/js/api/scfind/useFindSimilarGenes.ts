import useSWR from 'swr';
import { fetcher } from 'js/helpers/swr';
import { useAppContext } from 'js/components/Contexts';
import { createScFindKey } from './utils';

export interface FindSimilarGenesParams {
  geneList: string | string[];
  datasetName: string | string[];
  topK?: number;
}

type FindSimilarGenesKey = string;

interface FindSimilarGenesResponse {
  evaluateMarkers: unknown;
}

export function createFindSimilarGenesKey(
  scFindEndpoint: string,
  { geneList, datasetName, topK }: FindSimilarGenesParams,
): FindSimilarGenesKey {
  return createScFindKey(scFindEndpoint, 'findSimilarGenes', {
    gene_list: Array.isArray(geneList) ? geneList.join(',') : geneList,
    dataset_name: Array.isArray(datasetName) ? datasetName.join(',') : datasetName,
    top_k: topK ? topK.toString() : undefined,
  });
}

export default function useFindSimilarGenes(params: FindSimilarGenesParams) {
  const { scFindEndpoint } = useAppContext();
  const key = createFindSimilarGenesKey(scFindEndpoint, params);
  return useSWR<FindSimilarGenesResponse, unknown, FindSimilarGenesKey>(key, (url) => fetcher({ url }));
}
