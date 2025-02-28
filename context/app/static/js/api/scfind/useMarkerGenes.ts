import useSWR from 'swr';
import { fetcher } from 'js/helpers/swr';
import { useAppContext } from 'js/components/Contexts';
import { createScFindKey } from './utils';

type MarkerGenesKey = string;

type MarkerGenesResponse = object[];

export interface MarkerGenesParams {
  markerGenes: string | string[];
  datasetName?: string;
}

function createMarkerGenesKey(scFindApiUrl: string, { markerGenes, datasetName }: MarkerGenesParams): MarkerGenesKey {
  return createScFindKey(scFindApiUrl, 'marker_genes', {
    marker_genes: Array.isArray(markerGenes) ? markerGenes.join(',') : markerGenes,
    dataset_name: datasetName,
  });
}

export default function useMarkerGenes(params: MarkerGenesParams) {
  const { scFindEndpoint } = useAppContext();
  const key = createMarkerGenesKey(scFindEndpoint, params);
  return useSWR<MarkerGenesResponse, unknown, MarkerGenesKey>(key, (url) => fetcher({ url }));
}
