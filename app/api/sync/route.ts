import { NextRequest, NextResponse } from 'next/server';
import { databaseManager } from '../../../lib/database/connection';

/**
 * GET /api/sync - Get sync configuration and status
 */
export async function GET() {
  try {
    const config = databaseManager.getConfig();
    
    return NextResponse.json({
      success: true,
      data: {
        enabled: config.sync.enabled,
        remoteUrl: config.remote?.url || null,
        conflictResolution: config.sync.conflictResolution,
        syncInterval: config.remote?.syncInterval || 15,
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
      { status: 500 }
    );
  }
}

/**
 * POST /api/sync - Configure remote sync
 */
export async function POST(request: NextRequest) {
  try {
    const { remoteUrl, authToken, syncInterval = 15 } = await request.json();
    
    if (!remoteUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Remote URL is required',
        },
        { status: 400 }
      );
    }

    // Configure remote connection
    await databaseManager.configureRemote(remoteUrl, authToken);
    
    // Update sync interval
    databaseManager.updateConfig({
      remote: {
        url: remoteUrl,
        authToken,
        syncInterval,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Sync configuration updated successfully',
    });
  } catch (error) {
    console.error('Failed to configure sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to configure sync',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sync - Disable sync
 */
export async function DELETE() {
  try {
    databaseManager.updateConfig({
      sync: { enabled: false, conflictResolution: 'local' },
      remote: undefined,
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
      { status: 500 }
    );
  }
}
