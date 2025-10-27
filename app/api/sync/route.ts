import { NextRequest, NextResponse } from 'next/server';
import { dbm, DatabaseManagerServer } from '../../../lib/db/server';

/**
 * GET /api/sync - Get sync configuration and status
 */
export async function GET() {
  try {
    if (!(dbm instanceof DatabaseManagerServer))
      throw new TypeError(
        'Online API called with local database manager. This endpoint must run in a server context.',
      );
    await dbm.ensureDatabaseInitialised();
    const config = dbm.getConfig();

    const connectionType = config.remote?.url
      ? 'remote'
      : config.localServer?.url
        ? 'local'
        : 'none';
    const remoteUrl = config.remote?.url || null;
    const localUrl = config.localServer?.url || null;
    const syncInterval =
      config.remote?.syncInterval ?? config.localServer?.syncInterval ?? 15;

    return NextResponse.json({
      success: true,
      data: {
        enabled: config.sync.enabled,
        connectionType,
        remoteUrl,
        localUrl,
        conflictResolution: config.sync.conflictResolution,
        syncInterval,
        lastSync: null, // Would be populated from sync metadata
      },
    });
  } catch (error) {
    console.error('Failed to get sync configuration:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve sync configuration',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/sync - Configure remote sync
 */
export async function POST(request: NextRequest) {
  try {
    const {
      connectionType = 'none',
      remoteUrl,
      localUrl,
      authToken,
      syncInterval = 15,
      conflictResolution = 'local',
    } = await request.json();

    // Handle remote configuration
    if (connectionType === 'remote') {
      if (!remoteUrl) {
        return NextResponse.json(
          { success: false, error: 'Remote URL is required for remote mode' },
          { status: 400 },
        );
      }

      if (dbm instanceof DatabaseManagerServer) {
        // attempt to configure remote (will test access)
        await dbm.configureRemote(remoteUrl, authToken);
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Remote sync configuration is only available on the server.',
          },
          { status: 400 },
        );
      }

      dbm.updateConfig({
        remote: { url: remoteUrl, authToken, syncInterval },
        localServer: undefined,
        sync: { enabled: true, conflictResolution },
      });

      return NextResponse.json({
        success: true,
        message: 'Remote sync configuration updated successfully',
      });
    }

    // Handle local configuration (HTTP shim)
    if (connectionType === 'local') {
      if (!localUrl) {
        return NextResponse.json(
          { success: false, error: 'Local URL is required for local mode' },
          { status: 400 },
        );
      }

      // Persist local server info; do not attempt heavy probing here
      dbm.updateConfig({
        localServer: { url: localUrl, authToken, syncInterval },
        remote: undefined,
        sync: { enabled: true, conflictResolution },
      });

      return NextResponse.json({
        success: true,
        message: 'Local sync configuration saved',
      });
    }

    // connectionType === 'none' => disable sync and clear endpoints
    dbm.updateConfig({
      sync: { enabled: false, conflictResolution: 'local' },
      remote: undefined,
      localServer: undefined,
    });

    return NextResponse.json({ success: true, message: 'Sync disabled' });
  } catch (error) {
    console.error('Failed to configure sync:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to configure sync',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/sync - Disable sync
 */
export async function DELETE() {
  try {
    dbm.updateConfig({
      sync: { enabled: false, conflictResolution: 'local' },
      remote: undefined,
      localServer: undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Sync disabled successfully',
    });
  } catch (error) {
    console.error('Failed to disable sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to disable sync',
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/sync - Process sync queue
 */
export async function PATCH() {
  try {
    // Only call processSyncQueue if running on server (type assertion)

    if (dbm instanceof DatabaseManagerServer) {
      await dbm.processSyncQueue();
      return NextResponse.json({
        success: true,
        message: 'Sync queue processed successfully',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Sync queue processing is only available on the server.',
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('Failed to process sync queue:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process sync queue',
      },
      { status: 500 },
    );
  }
}
