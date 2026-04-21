import {
  createPluginResource,
  isWorkbenchPluginApiEnabled,
  listPluginResource,
} from './plugin-api-client';

describe('plugin-api-client', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.WORKBENCH_PLUGIN_API_BASE_URL = 'http://plugin.local/api';
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('detects when plugin API is configured', () => {
    expect(isWorkbenchPluginApiEnabled()).toBe(true);
    delete process.env.WORKBENCH_PLUGIN_API_BASE_URL;
    delete process.env.PLUGIN_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_PLUGIN_API_BASE_URL;
    expect(isWorkbenchPluginApiEnabled()).toBe(false);
  });

  it('lists resources from plugin API', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          items: [{ id: 'a1' }],
          total: 1,
        },
      }),
    } as Response);

    const result = await listPluginResource<{ id: string }>('actors', {
      search: 'john',
      limit: 10,
    });

    expect(result).toEqual({ items: [{ id: 'a1' }], total: 1 });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://plugin.local/api/actors?search=john&limit=10',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('creates resources through plugin API', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: { id: 'v1', eventId: 'e1', name: 'Jane' },
      }),
    } as Response);

    const result = await createPluginResource<
      { eventId: string; name: string },
      { id: string; eventId: string; name: string }
    >('victims', { eventId: 'e1', name: 'Jane' });

    expect(result).toEqual({ id: 'v1', eventId: 'e1', name: 'Jane' });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://plugin.local/api/victims',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws a plugin error response message', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        error: { code: 'forbidden', message: 'Permission denied' },
      }),
    } as Response);

    await expect(listPluginResource('actors')).rejects.toThrow(
      'Permission denied',
    );
  });
});
