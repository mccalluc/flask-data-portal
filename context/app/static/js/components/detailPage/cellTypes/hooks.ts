import useSWR from 'swr';

import { fetcher } from 'js/helpers/swr';

export const useCellTypesList = () => {
  const { data, error } = useSWR(`/cell-types/list.json`, (url) => fetcher({ url }), {
    revalidateOnFocus: false,
  });
  return {
    cellTypes: data,
    isLoading: !error && !data,
    isError: error,
  };
};
