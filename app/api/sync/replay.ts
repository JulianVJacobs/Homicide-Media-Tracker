type ReplayStatus = 'replayed' | 'duplicate' | 'failed';

export type ReplayOperation = {
  queueId?: number;
  requestId?: string;
  method: string;
  endpoint: string;
  body?: unknown;
};

export type ReplayResult = {
  queueId?: number;
  requestId?: string;
  method: string;
  endpoint: string;
  status: ReplayStatus;
  statusCode?: number;
  error?: string;
};

type ReplayContext = {
  requestOrigin: string;
  remoteBaseUrl?: string;
  remoteAuthToken?: string;
  forwardedHeaders?: Record<string, string | undefined>;
  replayCache: Map<string, ReplayResult>;
  fetchImpl?: typeof fetch;
};

const MAX_REPLAY_CACHE_ENTRIES = 500;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function trimReplayCache(cache: Map<string, ReplayResult>): void {
  while (cache.size > MAX_REPLAY_CACHE_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (!firstKey) {
      return;
    }
    cache.delete(firstKey);
  }
}

function toSafeMethod(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const method = value.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return null;
  }
  return method;
}

function toSafeEndpoint(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  if (!value.startsWith('/api/') || value.startsWith('/api/sync')) {
    return null;
  }

  return value;
}

export function normalizeReplayOperations(input: unknown): ReplayOperation[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const method = toSafeMethod(item.method);
    const endpoint = toSafeEndpoint(item.endpoint);

    if (!method || !endpoint) {
      return [];
    }

    return [
      {
        queueId: typeof item.queueId === 'number' ? item.queueId : undefined,
        requestId:
          typeof item.requestId === 'string' && item.requestId.trim()
            ? item.requestId.trim()
            : undefined,
        method,
        endpoint,
        body: item.body,
      },
    ];
  });
}

function resolveReplayUrl(
  endpoint: string,
  requestOrigin: string,
  remoteBaseUrl?: string,
): string {
  if (remoteBaseUrl) {
    const base = remoteBaseUrl.replace(/\/+$/, '');
    return `${base}${endpoint}`;
  }
  return new URL(endpoint, requestOrigin).toString();
}

export async function replayOfflineOperations(
  operations: ReplayOperation[],
  context: ReplayContext,
): Promise<{ ackedQueueIds: number[]; results: ReplayResult[] }> {
  const fetchImpl = context.fetchImpl ?? fetch;
  const ackedQueueIds: number[] = [];
  const results: ReplayResult[] = [];

  for (const operation of operations) {
    const { queueId, requestId, method, endpoint, body } = operation;

    if (requestId) {
      const cachedResult = context.replayCache.get(requestId);
      if (cachedResult) {
        results.push({
          ...cachedResult,
          queueId,
          requestId,
          status: 'duplicate',
        });
        if (typeof queueId === 'number') {
          ackedQueueIds.push(queueId);
        }
        continue;
      }
    }

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Offline-Replay': '1',
    };

    if (context.forwardedHeaders?.authorization) {
      requestHeaders.Authorization = context.forwardedHeaders.authorization;
    } else if (context.remoteAuthToken) {
      requestHeaders.Authorization = `Bearer ${context.remoteAuthToken}`;
    }

    if (context.forwardedHeaders?.cookie) {
      requestHeaders.Cookie = context.forwardedHeaders.cookie;
    }

    if (requestId) {
      requestHeaders['X-Idempotency-Key'] = requestId;
    }

    try {
      const replayUrl = resolveReplayUrl(
        endpoint,
        context.requestOrigin,
        context.remoteBaseUrl,
      );
      const response = await fetchImpl(replayUrl, {
        method,
        headers: requestHeaders,
        body: method === 'DELETE' ? undefined : JSON.stringify(body ?? {}),
      });

      const replayResult: ReplayResult = {
        queueId,
        requestId,
        method,
        endpoint,
        status: response.ok ? 'replayed' : 'failed',
        statusCode: response.status,
        error: response.ok ? undefined : `${response.status} ${response.statusText}`,
      };

      results.push(replayResult);
      if (response.ok && typeof queueId === 'number') {
        ackedQueueIds.push(queueId);
      }

      if (response.ok && requestId) {
        context.replayCache.set(requestId, replayResult);
        trimReplayCache(context.replayCache);
      }
    } catch (error) {
      results.push({
        queueId,
        requestId,
        method,
        endpoint,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { ackedQueueIds, results };
}
