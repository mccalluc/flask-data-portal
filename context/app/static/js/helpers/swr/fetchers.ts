import { SWRError } from './errors';

interface FetchOptionsType {
  expectedStatusCodes?: number[];
}

type SingleFetchOptionsType = FetchOptionsType & {
  requestInit?: RequestInit;
  url: string;
};

type MultiFetchOptionsType = FetchOptionsType & {
  urls: string[];
  requestInits?: RequestInit[];
};

/**
 * SWR fetcher which accepts an array of URLs and returns the responses as JSON
 * A custom requestInit object can be passed to fetch as well.
 * @example // without requestInit
 * const { data } = useSWR({ urls, multiFetcher });
 * @example // with requestInit
 * const { data } = useSWR({ urls, token }, ({ urls, token }) => multiFetcher({ urls, { headers: { Authorization: `Bearer ${token}` } } })
 * @param fetchOptions
 * @param fetchOptions.urls - Array of URLs to fetch
 * @param fetchOptions.requestInit - Optional RequestInit object to pass to fetch
 * @param fetchOptions.expectedStatusCodes - Optional array of status codes which reflect a succesful request
 */

export async function multiFetcher<T>({
  urls,
  requestInits = [{}],
  expectedStatusCodes = [200],
}: MultiFetchOptionsType) {
  const f = (url: string, requestInit: RequestInit) =>
    fetch(url, requestInit).then(async (response) => {
      if (!expectedStatusCodes.includes(response.status)) {
        const error = new SWRError(`The request to ${urls.join(', ')} failed.`, {
          info: (await response.json()) as object,
          status: response.status,
        });
        throw error;
      }
      return response.json();
    });

  if (urls.length === 0) {
    return Promise.resolve([] as T[]);
  }
  return Promise.all(
    urls.map((url, i) => f(url, requestInits.length === 1 ? requestInits[0] : requestInits[i])),
  ) as Promise<T[]>;
}

/**
 * SWR fetcher which accepts a single URL and returns the response as JSON.
 * A custom requestInit object can be passed to fetch as well.
 * @example // without requestInit
 * const { data } = useSWR({ urls, fetcher });
 * @example // with requestInit
 * const { data } = useSWR({ urls, token }, ({ urls, token }) => multiFetcher({ urls, { headers: { Authorization: `Bearer ${token}` } } })
 * @param fetchOptions
 * @param fetchOptions.url - URL to fetch
 * @param fetchOptions.requestInit - Optional RequestInit object to pass to fetch
 * @param fetchOptions.expectedStatusCodes - Optional array of status codes which reflect a succesful request
 */
export async function fetcher<T>({ url, requestInit = {}, expectedStatusCodes = [200] }: SingleFetchOptionsType) {
  return multiFetcher({ urls: [url], requestInits: [requestInit], expectedStatusCodes }).then(
    (data) => data[0],
  ) as Promise<T>;
}
