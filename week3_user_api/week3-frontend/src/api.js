const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const currentHostname = window.location.hostname;
const apiUrl = configuredApiUrl
  ? new URL(configuredApiUrl)
  : new URL(`${window.location.protocol}//${currentHostname}:5000`);

if (
  ["localhost", "127.0.0.1", "::1", "[::1]"].includes(apiUrl.hostname) &&
  !["localhost", "127.0.0.1", "::1", "[::1]"].includes(currentHostname)
) {
  apiUrl.hostname = currentHostname;
}

export const API_URL = apiUrl.origin;
