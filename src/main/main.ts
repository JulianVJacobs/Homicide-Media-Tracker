/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * Homicide Media Tracker - Electron Main Process
 * 
 * This module manages the Next.js standalone server and Electron window.
 * In development, it connects to the Next.js dev server.
 * In production, it spawns the Next.js standalone server as a child process.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { spawn, ChildProcess } from 'child_process';
import http from 'http';
import net from 'net';
import MenuBuilder from './menu';
import { databaseManager } from '../../lib/database/connection';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    log.transports.console.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let nextServer: ChildProcess | null = null;
let serverPort: number = 3000;

// Utility functions for server management
const findAvailablePort = (startPort: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = (server.address() as net.AddressInfo).port;
      server.close(() => resolve(port));
    });
    
    server.on('error', () => {
      findAvailablePort(startPort + 1).then(resolve).catch(reject);
    });
  });
};

const waitForServer = (url: string, timeout = 30000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkServer = () => {
      const req = http.get(url, { timeout: 1000 }, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          scheduleNextCheck();
        }
      });
      
      req.on('error', () => {
        scheduleNextCheck();
      });
      
      req.on('timeout', () => {
        req.destroy();
        scheduleNextCheck();
      });
    };
    
    const scheduleNextCheck = () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Server startup timeout after ${timeout}ms`));
      } else {
        setTimeout(checkServer, 500);
      }
    };
    
    checkServer();
  });
};

const startNextServer = async (): Promise<string> => {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Development: assume Next.js dev server is running
    const serverUrl = 'http://localhost:3000';
    try {
      await waitForServer(serverUrl, 5000);
      log.info('Connected to Next.js development server');
      return serverUrl;
    } catch (error) {
      log.error('Next.js development server not found. Please run "npm run dev" first.');
      throw error;
    }
  } else {
    // Production: start Next.js standalone server
    const port = await findAvailablePort(3000);
    serverPort = port;
    const serverUrl = `http://localhost:${port}`;
    
    // Path to the standalone server - in packaged app, server.js should be unpacked
    const isPackaged = app.isPackaged;
    const serverPath = isPackaged 
      ? path.join(process.resourcesPath, 'app.asar.unpacked', 'server.js')
      : path.join(__dirname, '../../.next/standalone/server.js');
    
    log.info(`Starting Next.js server at ${serverUrl}`);
    log.info(`Server path: ${serverPath}`);
    
    // Use the appropriate Node.js executable based on environment
    const nodeExecutable = isPackaged 
      ? process.execPath  // In packaged mode, we'll need to handle this differently
      : 'node';
    
    log.info(`Using Node executable: ${nodeExecutable}`);
    
    // In packaged mode, we need to use Electron's Node.js runtime
    if (isPackaged) {
      log.warn('Note: Using Electron executable for Node.js runtime in packaged mode');
      log.info(`Electron version: ${process.versions.electron}`);
      log.info(`Node version: ${process.versions.node}`);
    }
    
    // Start Next.js server as child process
    const spawnArgs = [serverPath];
    
    nextServer = spawn(nodeExecutable, spawnArgs, {
      env: {
        ...process.env,
        PORT: port.toString(),
        HOSTNAME: 'localhost',
        NODE_ENV: 'production',
        // Ensure Electron runs in Node.js mode for the child process
        ...(isPackaged && { ELECTRON_RUN_AS_NODE: '1' }),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // Log server output
    if (nextServer.stdout) {
      nextServer.stdout.on('data', (data) => {
        log.info(`Next.js Server: ${data.toString().trim()}`);
      });
    }
    
    if (nextServer.stderr) {
      nextServer.stderr.on('data', (data) => {
        log.error(`Next.js Server Error: ${data.toString().trim()}`);
      });
    }

    nextServer.on('error', (error) => {
      log.error('Failed to start Next.js server:', error);
      throw error;
    });

    nextServer.on('exit', (code, signal) => {
      log.info(`Next.js server exited with code ${code} and signal ${signal}`);
    });

    // Wait for server to be ready
    await waitForServer(serverUrl);
    log.info('Next.js standalone server is ready');
    
    return serverUrl;
  }
};

// IPC handlers for enhanced desktop integration
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

ipcMain.handle('get-server-port', () => {
  return serverPort;
});

// Database IPC handlers
ipcMain.handle('database-status', async () => {
  try {
    // Check if database is initialized
    if (!databaseManager.getLocal) {
      return {
        isInitialized: false,
        error: 'Database not initialized (running in packaged mode without database support)',
      };
    }
    
    const config = databaseManager.getConfig();
    return {
      isInitialized: true,
      syncEnabled: config.sync.enabled,
      localPath: config.local.path,
      remoteUrl: config.remote?.url || null,
    };
  } catch (error) {
    return {
      isInitialized: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});

ipcMain.handle('database-sync', async () => {
  try {
    if (!databaseManager.getLocal) {
      return {
        success: false,
        error: 'Database not initialized (running in packaged mode)',
      };
    }
    
    await databaseManager.syncWithRemote();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sync failed',
    };
  }
});

ipcMain.handle('database-backup', async () => {
  try {
    if (!databaseManager.getLocal) {
      return {
        success: false,
        error: 'Database not initialized (running in packaged mode)',
      };
    }
    
    const backupPath = await databaseManager.createBackup();
    return { success: true, backupPath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Backup failed',
    };
  }
});

ipcMain.handle('show-message-box', async (event, options) => {
  const { dialog } = require('electron');
  if (mainWindow) {
    return dialog.showMessageBox(mainWindow, options);
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async (): Promise<void> => {
  if (isDebug) {
    await installExtensions();
  }

  // Initialize database first - with enhanced packaging support
  try {
    log.info('Initializing local database...');
    log.info(`App is packaged: ${app.isPackaged}`);
    log.info(`Resources path: ${process.resourcesPath}`);
    log.info(`App path: ${app.getAppPath()}`);
    
    await databaseManager.initialiseLocal();
    log.info('Database initialized successfully');
    
    // Start auto-sync if enabled
    databaseManager.startAutoSync();
  } catch (error) {
    log.error('Failed to initialize database:', error);
    log.error('Database error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    
    // In development, this should throw to help debugging
    if (!app.isPackaged) {
      log.error('Development mode - rethrowing database error for debugging');
      throw error;
    }
    
    // In packaged mode, continue startup but log the failure
    log.warn('Packaged mode - continuing app startup without database functionality');
  }

  // Start Next.js server
  let serverUrl: string;
  try {
    serverUrl = await startNextServer();
  } catch (error) {
    log.error('Failed to start Next.js server:', error);
    app.quit();
    return;
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 800,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, 'preload.js'),
    },
  });

  // Load the Next.js server URL
  mainWindow.loadURL(serverUrl);

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Cleanup: Close database connections (if initialized)
  try {
    databaseManager.close().catch((error) => {
      log.error('Error closing database:', error);
    });
  } catch (error) {
    // Database wasn't initialized - no cleanup needed
    log.info('Database cleanup skipped (not initialized)');
  }
  
  // Cleanup: Kill Next.js server when all windows are closed
  if (nextServer) {
    log.info('Terminating Next.js server...');
    nextServer.kill('SIGTERM');
    
    // Force kill after timeout
    setTimeout(() => {
      if (nextServer && !nextServer.killed) {
        log.warn('Force killing Next.js server');
        nextServer.kill('SIGKILL');
      }
    }, 5000);
  }

  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cleanup on app quit
app.on('before-quit', () => {
  // Close database connections first (if initialized)
  try {
    databaseManager.close().catch((error) => {
      log.error('Error closing database during quit:', error);
    });
  } catch (error) {
    // Database wasn't initialized - no cleanup needed
    log.info('Database cleanup on quit skipped (not initialized)');
  }
  
  if (nextServer) {
    log.info('App quitting, terminating Next.js server...');
    nextServer.kill('SIGTERM');
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch((error) => {
    log.error('Failed to start application:', error);
    console.log(error);
  });
