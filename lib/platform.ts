// Platform detection utilities for dual Next.js/Electron app

export const isElectron = () => {
  return (
    typeof window !== 'undefined' &&
    window.process &&
    window.process.type === 'renderer'
  );
};

export const isWeb = () => {
  return !isElectron();
};

export const getEnvironment = () => {
  if (typeof window === 'undefined') return 'server';
  return isElectron() ? 'electron' : 'web';
};

// Type definitions for Electron in window
declare global {
  interface Window {
    process?: {
      type?: string;
    };
    electron?: {
      // Add your electron API methods here
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on: (channel: string, func: (...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
      };
    };
  }
}

export default {
  isElectron,
  isWeb,
  getEnvironment,
};
