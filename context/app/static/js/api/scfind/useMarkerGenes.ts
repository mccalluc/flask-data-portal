import useSWR from 'swr';
import { fetcher } from 'js/helpers/swr';
import { createScfindKey } from './utils';

type MarkerGenesKey = string;

type MarkerGenesResponse = object[];

export interface MarkerGenesParams {
  markerGenes: string | string[];
  datasetName?: string;
}

function createMarkerGenesKey({ markerGenes, datasetName }: MarkerGenesParams): MarkerGenesKey {
  return createScfindKey('marker_genes', {
    marker_genes: Array.isArray(markerGenes) ? markerGenes.join(',') : markerGenes,
    dataset_name: datasetName,
  });
}

export default function useMarkerGenes(params: MarkerGenesParams) {
  const key = createMarkerGenesKey(params);
  return useSWR<MarkerGenesResponse, unknown, MarkerGenesKey>(key, (url) => fetcher({ url }));
}
