export const SCFIND_BASE_STORYBOOK = 'http://scfind.hubmapconsortium.org';

/**
 * Helper method to form URLs for SCFind API requests
 *
 * @param scFindApiUrl - The base URL for the SCFind API
 * @param endpoint - The endpoint to hit
 * @param params - The parameters to include in the URL
 */
export function createScFindKey(
  scFindApiUrl: string,
  endpoint: string,
  params: Record<string, string | undefined>,
): string {
  const urlParams = new URLSearchParams();
  // Filter out undefined values from url params
  Object.entries(params)
    .filter(([, value]) => value)
    .forEach(([key, value]) => urlParams.append(key, value!));
  const fullUrl = new URL(`${scFindApiUrl}/api/${endpoint}?${urlParams.toString()}`);
  return fullUrl.toString();
}
