'use client';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import {
  exportDbToBlob,
  saveBlobToFile,
  verifyEvictionMarker,
  writeEvictionMarker,
  hasAnyData,
} from '../utils/db-io';
import {
  getStoredDirectoryHandle,
  storeDirectoryHandle,
} from '../utils/fs-utils';
import { FolderOpen } from 'lucide-react';

export default function BootPWA() {
  const MAYBE_LATER_KEY = 'backupMaybeLaterAt';
  const INACTIVITY_DAYS = 30; // remind after 30 days of inactivity
  const INACTIVITY_MS = INACTIVITY_DAYS * 24 * 60 * 60 * 1000;

  // (no-op) usage heartbeat removed — we rely on Maybe later timestamp only

  useEffect(() => {
    const requestPersistentStorage = async () => {
      if (!('storage' in navigator) || !navigator.storage.persist) {
        return false;
      }

      try {
        if (await navigator.storage.persisted?.()) {
          // notify components that persistence is available
          window.dispatchEvent(
            new CustomEvent('persistence-status', {
              detail: { persistent: true },
            }),
          );
          return true;
        }

        const granted = await navigator.storage.persist();
        if (!granted) {
          console.warn('[SW] storage persistence not granted');
          window.dispatchEvent(
            new CustomEvent('persistence-status', {
              detail: { persistent: false },
            }),
          );
        } else {
          console.info('[SW] storage persistence granted');
          window.dispatchEvent(
            new CustomEvent('persistence-status', {
              detail: { persistent: true },
            }),
          );
        }
        return granted;
      } catch (error) {
        console.warn('[SW] storage persistence request failed', error);
        return false;
      }
    };

    let loadHandler: (() => void) | null = null;

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
          void requestPersistentStorage();
        } catch (error) {
          console.error('[SW] registration failed', error);
        }
      };

      if (document.readyState === 'complete') {
        void register();
      } else {
        loadHandler = () => {
          void register();
        };
        window.addEventListener('load', loadHandler, { once: true });
      }
    } else {
      void requestPersistentStorage();
    }

    // Monitor storage usage and prompt backups if approaching quota
    let intervalId: number | null = null;
    const THRESHOLD = 0.85; // 85% of quota
    const POLL_INTERVAL = 1000 * 60 * 5; // 5 minutes
    let lastNotified = 0;

    let lastUsage: number | null = null;
    const checkStorage = async () => {
      try {
        if (!('storage' in navigator) || !navigator.storage.estimate) return;
        const { usage, quota } = await navigator.storage.estimate();
        if (
          typeof usage !== 'number' ||
          typeof quota !== 'number' ||
          quota <= 0
        )
          return;
        const pct = usage / quota;
        // Eviction heuristic: significant drop in usage indicates possible eviction
        if (
          lastUsage !== null &&
          usage < lastUsage * 0.5 &&
          lastUsage > 1024 * 1024 * 5
        ) {
          // if usage dropped more than 50% and prior usage was >5MB, signal eviction
          window.dispatchEvent(
            new CustomEvent('db-evicted', {
              detail: { previousUsage: lastUsage, currentUsage: usage },
            }),
          );
        }
        lastUsage = usage;
        // Only notify once per hour to avoid spamming
        const now = Date.now();
        if (pct >= THRESHOLD && now - lastNotified > 1000 * 60 * 60) {
          lastNotified = now;
          // Show toast with action to backup
          const id = toast.info(
            <div>
              Storage usage is high ({Math.round(pct * 100)}%). Please backup
              your data to avoid loss.
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-sm btn-primary me-2"
                  onClick={async () => {
                    toast.dismiss(id);
                    try {
                      const blob = await exportDbToBlob();
                      await saveBlobToFile(blob, 'homicide-db.json');
                      toast.success('Backup saved');
                    } catch (err) {
                      console.error('Auto backup failed', err);
                      toast.error('Backup failed');
                    }
                  }}
                >
                  Backup now
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => toast.dismiss(id)}
                >
                  Dismiss
                </button>
              </div>
            </div>,
            { autoClose: false },
          );
          // also dispatch a storage-warning so UI can show modal/banner
          window.dispatchEvent(
            new CustomEvent('storage-warning', {
              detail: { usage, quota, pct },
            }),
          );
        }
      } catch (err) {
        // Ignore
      }
    };

    // Run immediately and then on interval (guarded for SSR)
    if (typeof window !== 'undefined') {
      void checkStorage();
      intervalId = globalThis.setInterval(
        checkStorage,
        POLL_INTERVAL,
      ) as unknown as number;
    }

    // Also check when visibility changes or comes online
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void checkStorage();
    };
    const onOnline = () => void checkStorage();
    document.addEventListener('visibilitychange', onVisibility);
    if (typeof window !== 'undefined')
      window.addEventListener('online', onOnline);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
      if (typeof window !== 'undefined')
        window.removeEventListener('online', onOnline);
      if (typeof loadHandler === 'function' && typeof window !== 'undefined') {
        window.removeEventListener('load', loadHandler as EventListener);
      }
    };
  }, []);
  // Also show a modal to prompt for a backup folder if none is persisted
  const [showPickModal, setShowPickModal] = useState(false);

  // On mount, check for existing stored folder and offer to pick one if missing
  useEffect(() => {
    (async () => {
      try {
        const h = await getStoredDirectoryHandle('backup-folder');
        if (!h) {
          // no stored folder -> require the user to pick one
          setShowPickModal(true);
        }
        // verify Dexie eviction marker: if missing and DB has data, signal eviction
        try {
          const markerExists = await verifyEvictionMarker();
          if (!markerExists) {
            const anyData = await hasAnyData();
            if (anyData) {
              window.dispatchEvent(
                new CustomEvent('db-evicted', { detail: {} }),
              );
            } else {
              // fresh DB; write marker so future runs can detect eviction
              await writeEvictionMarker();
            }
          }
        } catch (err) {
          // ignore marker check errors
        }
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  // Re-open the picker modal if a storage warning occurs
  useEffect(() => {
    const onStorageWarning = () => setShowPickModal(true);
    window.addEventListener(
      'storage-warning',
      onStorageWarning as EventListener,
    );
    return () =>
      window.removeEventListener(
        'storage-warning',
        onStorageWarning as EventListener,
      );
  }, []);

  // Maybe later handling + inactivity heuristic
  useEffect(() => {
    const checkMaybeLater = () => {
      try {
        const t = localStorage.getItem(MAYBE_LATER_KEY);
        if (!t) return false;
        const ts = Number(t) || 0;
        // remind after INACTIVITY_DAYS since the user chose Maybe later
        if (Date.now() - ts > INACTIVITY_MS) {
          setShowPickModal(true);
          return true;
        }
        return false;
      } catch (e) {
        return false;
      }
    };

    // check on mount
    checkMaybeLater();

    // also periodically check while app is open (every hour)
    const pollId = globalThis.setInterval(
      () => checkMaybeLater(),
      1000 * 60 * 60,
    );
    return () => clearInterval(pollId);
  }, [INACTIVITY_MS]);

  const handlePickFromBoot = async () => {
    const w = window as unknown as Window & {
      showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
    };
    if (!w.showDirectoryPicker) {
      toast.info('Directory picker not supported');
      return;
    }
    try {
      const handle = await w.showDirectoryPicker();
      await storeDirectoryHandle('backup-folder', handle);
      window.dispatchEvent(
        new CustomEvent('backup-folder-selected', {
          detail: { name: handle.name },
        }),
      );
      toast.success('Backup folder saved');
      // close modal once a folder is selected and persisted
      setShowPickModal(false);
    } catch (err) {
      // user cancelled
      toast.info('Pick cancelled');
      setShowPickModal(false);
    }
  };

  // Accessibility: focus management for dialogs
  const pickModalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = showPickModal ? pickModalRef.current : null;
    if (!target) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // focus first focusable element inside dialog
    const focusable = target.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length) focusable[0].focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // trap focus
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previouslyFocused) previouslyFocused.focus();
    };
  }, [showPickModal]);

  // Render a lightweight modal if needed
  // Provide a fallback flow if showDirectoryPicker is not available
  const supportsDirectoryPicker =
    typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  return (
    <Dialog
      open={showPickModal}
      // If directory picker is supported, do not allow closing the dialog
      onOpenChange={(open) => {
        if (!supportsDirectoryPicker) setShowPickModal(open);
      }}
    >
      <DialogContent id="boot-pwa-title" className="text-gray-600">
        {supportsDirectoryPicker ? (
          <>
            <DialogHeader>Select a backup folder (required)</DialogHeader>
            <div className="text-gray-700 leading-relaxed">
              <p>
                This application requires a folder for automatic backups. Please
                pick a folder now to ensure your data is protected. You will not
                be able to continue until you select a folder.
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <div
                className="flex-1 rounded border border-gray-200 px-3 py-2 flex items-center justify-between cursor-pointer"
                onClick={handlePickFromBoot}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handlePickFromBoot();
                }}
              >
                <span className="text-gray-500">Pick a backup folder</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handlePickFromBoot}
                >
                  <FolderOpen className="stroke-gray-600" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>Backup folder not available</DialogHeader>
            <div className="text-gray-700 leading-relaxed">
              <p>
                Your browser does not support persistent folder access via the
                File System Access API. Using this app in this browser may lead
                to data loss if the browser evicts local storage. Consider using
                a supported browser (Chrome, Edge, or a Chromium-based browser)
                or make frequent manual backups.
              </p>
            </div>

            <div className="mt-4 flex flex-col items-start gap-3">
              <div className="text-sm text-gray-700 w-full">
                <p className="mb-2">How to export backups manually:</p>
                <ol className="list-decimal list-inside text-sm text-gray-600">
                  <li>
                    Open the System Information page (top-right menu → System
                    Information).
                  </li>
                  <li>
                    Choose &quot;Export / Backup&quot; and follow the prompts to
                    download your DB.
                  </li>
                  <li>
                    Store the exported JSON file in a safe location (external
                    drive or cloud storage).
                  </li>
                </ol>
              </div>

              <div className="flex flex-row justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    try {
                      window.dispatchEvent(
                        new CustomEvent('open-system-information'),
                      );
                    } catch (e) {}
                    // close the dialog when opening system info
                    setShowPickModal(false);
                  }}
                >
                  Open System Information
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    try {
                      localStorage.setItem(MAYBE_LATER_KEY, String(Date.now()));
                    } catch (e) {}
                    setShowPickModal(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
