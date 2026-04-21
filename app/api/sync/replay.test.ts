import {
  normalizeReplayOperations,
  replayOfflineOperations,
} from './replay';

describe('sync replay bridge', () => {
  it('filters invalid replay operations', () => {
    const operations = normalizeReplayOperations([
      { method: 'POST', endpoint: '/api/events', body: { id: '1' } },
      { method: 'GET', endpoint: '/api/events' },
      { method: 'POST', endpoint: '/api/sync' },
      'invalid',
    ]);

    expect(operations).toEqual([
      { method: 'POST', endpoint: '/api/events', body: { id: '1' } },
    ]);
  });

  it('replays queued operations once and de-duplicates repeat request ids', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
    });
    const replayCache = new Map();
    const operations = normalizeReplayOperations([
      {
        queueId: 1,
        requestId: 'req-1',
        method: 'POST',
        endpoint: '/api/events',
        body: { id: 'event-1' },
      },
      {
        queueId: 2,
        requestId: 'req-1',
        method: 'POST',
        endpoint: '/api/events',
        body: { id: 'event-1' },
      },
    ]);

    const result = await replayOfflineOperations(operations, {
      requestOrigin: 'http://localhost:3000',
      remoteBaseUrl: 'https://plugin.example',
      replayCache,
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://plugin.example/api/events',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Offline-Replay': '1',
          'X-Idempotency-Key': 'req-1',
        }),
      }),
    );
    expect(result.ackedQueueIds).toEqual([1, 2]);
    expect(result.results.map((entry) => entry.status)).toEqual([
      'replayed',
      'duplicate',
    ]);
  });

  it('applies forwarded authorization to replayed requests', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
      statusText: 'No Content',
    });
    const operations = normalizeReplayOperations([
      {
        queueId: 1,
        requestId: 'req-auth',
        method: 'PATCH',
        endpoint: '/api/events/event-1',
        body: { summary: 'updated' },
      },
    ]);

    await replayOfflineOperations(operations, {
      requestOrigin: 'http://localhost:3000',
      replayCache: new Map(),
      forwardedHeaders: {
        authorization: 'Bearer lane-06-acl-token',
      },
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/events/event-1',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer lane-06-acl-token',
        }),
      }),
    );
  });
});
