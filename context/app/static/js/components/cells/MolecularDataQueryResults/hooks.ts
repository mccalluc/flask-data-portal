import { useSearchHits } from 'js/hooks/useSearchData';
import { SearchHit } from '@elastic/elasticsearch/lib/api/types';
import { Dataset } from 'js/components/types';

import { getSearchQuery } from './utils';

function buildHitsMap<T>(hits: SearchHit<T>[]) {
  return hits.reduce(
    (acc, hit) => {
      acc[hit._id] = hit;
      return acc;
    },
    {} as Record<string, SearchHit<T>>,
  );
}

export function useAugmentedResults<T extends { uuid: string }>(inputResults: T[] = []) {
  const data = useSearchHits<Dataset>(getSearchQuery(inputResults), { shouldFetch: inputResults.length > 0 });

  const hitsMap = buildHitsMap(data.searchHits);

  return {
    hitsMap,
    length: data?.searchHits?.length ?? 0,
    list: Object.values(hitsMap) as Required<SearchHit<Dataset>>[],
  };
}
