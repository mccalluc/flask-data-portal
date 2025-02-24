// Current URL for SCFind as of 2/12/2025
// PROD
// export const SCFIND_BASE = 'http://scfind.hubmapconsortium.org/api';
// DEV
export const SCFIND_BASE = 'http://18.219.167.106:8080/api';

// TODO: Transfer to app config

/**
 * Helper method to form URLs for SCFind API requests
 *
 * @param endpoint - The endpoint to hit
 * @param params - The parameters to include in the URL
 */
export function createScfindKey(endpoint: string, params: Record<string, string | undefined>): string {
  const urlParams = new URLSearchParams();
  // Filter out undefined values from url params
  Object.entries(params)
    .filter(([, value]) => value)
    .forEach(([key, value]) => urlParams.append(key, value!));
  const fullUrl = new URL(`${SCFIND_BASE}/${endpoint}?${urlParams.toString()}`);
  return fullUrl.toString();
}
