import { getZohoConfig } from './zoho.config';
import { logger } from '../../observability/logger';

export interface CachedToken {
  value: string;
  expiresAtMs: number;
  apiDomain: string;
}

let cached: CachedToken | null = null;
let refreshPromise: Promise<CachedToken> | null = null;

async function requestNewToken(): Promise<CachedToken> {
  const config = getZohoConfig();

  if (!config.clientId || !config.clientSecret || !config.refreshToken) {
    throw new Error('Zoho OAuth credentials missing in configuration.');
  }

  const tokenUrl = `${config.accountsUrl}/oauth/v2/token`;
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: config.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  logger.info('Requesting new Zoho access token via refresh token...');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const body = await response.json() as any;

  if (!response.ok || body.error) {
    const errorMsg = body.error_description || body.error || body.message || (response.statusText ? `HTTP ${response.status} ${response.statusText}` : `HTTP ${response.status}`);
    logger.error('Failed to refresh Zoho access token', { error: errorMsg, body });
    const err: any = new Error(`Zoho token refresh failed: ${errorMsg}`);
    err.httpStatus = response.status || 400;
    err.code = body.error ? body.error.toUpperCase() : `AUTH_ERROR_${response.status}`;
    err.rawDetails = body;
    throw err;
  }

  const accessToken = body.access_token;
  const expiresInSeconds = body.expires_in || 3600;
  const apiDomain = body.api_domain || config.apiDomain;

  cached = {
    value: accessToken,
    expiresAtMs: Date.now() + expiresInSeconds * 1000,
    apiDomain,
  };

  logger.info('Zoho access token refreshed successfully', {
    expiresInSeconds,
    apiDomain,
  });

  return cached;
}

export async function getZohoAccessToken(forceRefresh = false): Promise<CachedToken> {
  const now = Date.now();

  // Return cached token if valid and outside 5 minute buffer
  if (!forceRefresh && cached && cached.expiresAtMs - now > 5 * 60_000) {
    return cached;
  }

  // Deduplicate concurrent refresh calls (single-flight)
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = requestNewToken().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export function clearTokenCache(): void {
  cached = null;
}
