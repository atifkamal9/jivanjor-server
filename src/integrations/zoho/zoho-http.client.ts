import { getZohoConfig } from './zoho.config';
import { getZohoAccessToken, clearTokenCache } from './zoho-token.provider';
import { ZohoRecordError } from './zoho-error.classifier';
import { logger } from '../../observability/logger';

export interface ZohoUpsertResult {
  zohoId: string;
  action: 'insert' | 'update' | string;
  duplicateField?: string | null;
  rawResponse: any;
}

export class ZohoHttpClient {
  /**
   * Search records in a Zoho CRM module (Contacts or Custom Module) by criteria.
   */
  async searchRecords(moduleName: string, criteria: string): Promise<any[]> {
    const config = getZohoConfig();
    const tokenInfo = await getZohoAccessToken();

    const url = `${tokenInfo.apiDomain}/crm/${config.apiVersion}/${moduleName}/search?criteria=${encodeURIComponent(criteria)}`;

    try {
      logger.info(`Searching Zoho CRM module ${moduleName} with criteria: ${criteria}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Zoho-oauthtoken ${tokenInfo.value}`,
        },
      });

      if (response.status === 204 || response.status === 404) {
        return [];
      }

      if (!response.ok) {
        logger.warn(`Zoho search returned HTTP ${response.status} for module ${moduleName}`);
        return [];
      }

      const body = (await response.json()) as any;
      return body?.data || [];
    } catch (err) {
      logger.error(`Error searching Zoho CRM module ${moduleName}:`, { err });
      return [];
    }
  }

  /**
   * Upsert a single record in a Zoho CRM module (Contacts or Custom Module).
   */
  async upsertRecord(
    moduleName: string,
    recordPayload: Record<string, any>,
    duplicateCheckFields: string[],
    retryCount = 0
  ): Promise<ZohoUpsertResult> {
    const config = getZohoConfig();
    const tokenInfo = await getZohoAccessToken();

    const url = `${tokenInfo.apiDomain}/crm/${config.apiVersion}/${moduleName}/upsert`;
    const requestBody = {
      data: [recordPayload],
      duplicate_check_fields: duplicateCheckFields,
      trigger: ['workflow'],
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.syncTimeoutMs);

    try {
      logger.info(`Sending upsert request to Zoho CRM module: ${moduleName}`, {
        url,
        duplicateCheckFields,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${tokenInfo.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized - retry once with forced token refresh
      if (response.status === 401 && retryCount < 1) {
        logger.warn('Zoho API returned 401. Refreshing token and retrying upsert...');
        clearTokenCache();
        await getZohoAccessToken(true);
        return this.upsertRecord(moduleName, recordPayload, duplicateCheckFields, retryCount + 1);
      }

      const body = (await response.json()) as any;

      if (!response.ok) {
        const item = body?.data?.[0];
        const detailMsg =
          body?.message ||
          body?.code ||
          item?.message ||
          item?.code ||
          body?.error ||
          (response.statusText ? `HTTP ${response.status} ${response.statusText}` : `HTTP ${response.status} Bad Request`);
        
        const detailsObj = item?.details || body?.details;
        const detailsStr = detailsObj ? ` (${JSON.stringify(detailsObj)})` : '';
        const errorMsg = `${detailMsg}${detailsStr}`;

        logger.error(`Zoho HTTP error for module ${moduleName}`, { status: response.status, body });
        const err: any = new Error(`Zoho API HTTP error: ${errorMsg}`);
        err.httpStatus = response.status;
        err.code = body?.code || item?.code || body?.error || `HTTP_${response.status}`;
        err.rawDetails = body;
        throw err;
      }

      // Inspect individual item result inside `data` array
      const item = body?.data?.[0];
      if (!item) {
        throw new ZohoRecordError('EMPTY_ZOHO_RESPONSE', 'Zoho returned an empty data array', body);
      }

      if (item.status !== 'success' || !item.details?.id) {
        logger.error(`Zoho record processing error for module ${moduleName}`, { item });
        throw new ZohoRecordError(
          item.code || 'ZOHO_RECORD_ERROR',
          item.message || 'Zoho record processing failed',
          item
        );
      }

      return {
        zohoId: item.details.id,
        action: item.action || 'upsert',
        duplicateField: item.duplicate_field || null,
        rawResponse: body,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        const timeoutErr: any = new Error(`Zoho API call timed out after ${config.syncTimeoutMs}ms`);
        timeoutErr.code = 'ZOHO_TIMEOUT';
        throw timeoutErr;
      }
      throw error;
    }
  }

  /**
   * Fetch field metadata for a Zoho CRM module (Contacts or Custom Module).
   */
  async fetchModuleFields(moduleName: string): Promise<any> {
    const config = getZohoConfig();
    const tokenInfo = await getZohoAccessToken();
    const url = `${tokenInfo.apiDomain}/crm/${config.apiVersion}/settings/fields?module=${moduleName}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Zoho-oauthtoken ${tokenInfo.value}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata for module ${moduleName}: HTTP ${response.status}`);
    }

    return response.json();
  }
}

export const zohoHttpClient = new ZohoHttpClient();
