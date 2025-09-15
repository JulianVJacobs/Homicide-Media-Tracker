// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke(channel: string, ...args: unknown[]): Promise<unknown> {
      return ipcRenderer.invoke(channel, ...args);
    },
  },
  // App information
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),
    getPlatform: (): Promise<string> => ipcRenderer.invoke('get-platform'),
    getServerPort: (): Promise<number> => ipcRenderer.invoke('get-server-port'),
  },
  // Database operations
  database: {
    getStatus: (): Promise<{
      isInitialized: boolean;
      syncEnabled: boolean;
      localPath: string;
      remoteUrl: string | null;
      error?: string;
    }> => ipcRenderer.invoke('database-status'),
    
    sync: (): Promise<{
      success: boolean;
      error?: string;
    }> => ipcRenderer.invoke('database-sync'),
    
    createBackup: (): Promise<{
      success: boolean;
      backupPath?: string;
      error?: string;
    }> => ipcRenderer.invoke('database-backup'),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
