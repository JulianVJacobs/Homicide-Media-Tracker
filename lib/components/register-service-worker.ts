'use client';
import { useEffect } from 'react';

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try {
          const registration =
            await navigator.serviceWorker.register('/service-worker.js');
          console.info(
            '[SW] registered',
            registration.scope,
            registration.updateViaCache,
          );
        } catch (error) {
          console.error('[SW] registration failed', error);
        }
      };

      if (document.readyState === 'complete') {
        void register();
      } else {
        const handleLoad = () => {
          void register();
        };
        window.addEventListener('load', handleLoad, { once: true });
        return () => window.removeEventListener('load', handleLoad);
      }
    }
  }, []);
  return null;
}
