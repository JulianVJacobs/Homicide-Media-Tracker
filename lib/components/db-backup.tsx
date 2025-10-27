'use client';
import React, { useRef, useState, useEffect } from 'react';
import {
  exportDbToBlob,
  importDbFromFile,
  saveBlobToFile,
  exportPartitionedNDJSON,
  PartitionManifestEntry,
} from '../utils/db-io';
import { loadPartitionFile } from '../utils/cache-manager';
import {
  getStoredDirectoryHandle,
  storeDirectoryHandle,
  saveBlobToDirectory,
} from '../utils/fs-utils';
import DbBackupStatus from './db-backup-status';

export default function DbBackup() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setWorking(true);
      setMessage(null);
      const blob = await exportDbToBlob();
      await saveBlobToFile(blob);
      setMessage('Export completed');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Export failed', err);
      setMessage('Export failed');
    } finally {
      setWorking(false);
    }
  };

  const handlePartitionedExport = async () => {
    try {
      setWorking(true);
      setMessage(null);
      setProgress('Preparing partitions...');
      const { manifest, manifestBlob, indexBlobs } =
        await exportPartitionedNDJSON({ maxRecordsPerChunk: 5000 });
      // save manifest
      // check for a stored backup directory
      const storedHandle = await getStoredDirectoryHandle('backup-folder');
      if (storedHandle) {
        try {
          await saveBlobToDirectory(
            storedHandle,
            'manifest.json',
            manifestBlob,
            false,
          );
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to save manifest to directory', err);
          await saveBlobToFile(manifestBlob, 'manifest.json');
        }
      } else {
        await saveBlobToFile(manifestBlob, 'manifest.json');
      }
      let saved = 0;
      for (const entry of manifest as PartitionManifestEntry[]) {
        setProgress(`Saving ${entry.fileName} (${saved}/${manifest.length})`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blob = (entry as any).blob as Blob;
        // eslint-disable-next-line no-await-in-loop
        if (storedHandle) {
          try {
            await saveBlobToDirectory(storedHandle, entry.fileName, blob, true);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error(
              'Failed to save partition to directory, falling back to download',
              err,
            );
            await saveBlobToFile(blob, entry.fileName);
          }
        } else {
          await saveBlobToFile(blob, entry.fileName);
        }
        saved++;
      }
      for (const ib of indexBlobs) {
        // eslint-disable-next-line no-await-in-loop
        if (storedHandle) {
          try {
            await saveBlobToDirectory(
              storedHandle,
              `${ib.table}-index.ndjson`,
              ib.blob,
              true,
            );
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error(
              'Failed to save index to directory, falling back to download',
              err,
            );
            await saveBlobToFile(ib.blob, `${ib.table}-index.ndjson`);
          }
        } else {
          await saveBlobToFile(ib.blob, `${ib.table}-index.ndjson`);
        }
      }
      setMessage('Partitioned export completed');
      setProgress(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Partitioned export failed', err);
      setMessage('Partitioned export failed');
      setProgress(null);
    } finally {
      setWorking(false);
    }
  };

  const handlePickBackupFolder = async () => {
    const w = window as unknown as Window & {
      showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
    };
    if (!w.showDirectoryPicker) {
      setMessage('Directory Picker not supported in this browser');
      return;
    }
    try {
      const handle = await w.showDirectoryPicker();
      await storeDirectoryHandle('backup-folder', handle);
      setBackupDirLabel(handle.name || 'backup-folder');
      setHasBackupDir(true);
      setMessage('Backup folder saved');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Folder pick failed', err);
      setMessage('Folder pick cancelled or failed');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      setWorking(true);
      setMessage(null);
      await importDbFromFile(file);
      setMessage('Import completed. Reload to reflect changes.');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Import failed', err);
      setMessage('Import failed');
    } finally {
      setWorking(false);
    }
  };

  const partitionRef = useRef<HTMLInputElement | null>(null);
  const manifestRef = useRef<HTMLInputElement | null>(null);
  const loadMultipleRef = useRef<HTMLInputElement | null>(null);
  const compactRef = useRef<HTMLInputElement | null>(null);
  const [manifestEntries, setManifestEntries] = useState<
    PartitionManifestEntry[]
  >([]);
  const [selectedPartitions, setSelectedPartitions] = useState<
    Record<string, boolean>
  >({});
  const [backupDirLabel, setBackupDirLabel] = useState<string | null>(null);
  const [hasBackupDir, setHasBackupDir] = useState(false);
  const [showPersistenceBanner, setShowPersistenceBanner] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);

  useEffect(() => {
    const onPersistence = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setShowPersistenceBanner(!detail?.persistent);
    };
    const onStorageWarning = () => {
      setShowStorageModal(true);
    };
    const onBackupSelected = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setHasBackupDir(true);
      if (detail?.name) setBackupDirLabel(detail.name);
      setMessage('Backup folder selected');
    };

    window.addEventListener(
      'persistence-status',
      onPersistence as EventListener,
    );
    window.addEventListener(
      'storage-warning',
      onStorageWarning as EventListener,
    );
    window.addEventListener(
      'backup-folder-selected',
      onBackupSelected as EventListener,
    );

    const onDbEvicted = () => {
      setMessage(
        'Database data appears to have been evicted. Please restore from backup if needed.',
      );
    };
    window.addEventListener('db-evicted', onDbEvicted as EventListener);

    (async () => {
      try {
        const h = await getStoredDirectoryHandle('backup-folder');
        if (h) {
          setHasBackupDir(true);
          setBackupDirLabel(h.name || 'backup-folder');
        }
      } catch (err) {
        // ignore
      }
    })();

    return () => {
      window.removeEventListener(
        'persistence-status',
        onPersistence as EventListener,
      );
      window.removeEventListener(
        'storage-warning',
        onStorageWarning as EventListener,
      );
      window.removeEventListener(
        'backup-folder-selected',
        onBackupSelected as EventListener,
      );
      window.removeEventListener('db-evicted', onDbEvicted as EventListener);
    };
  }, []);

  const handlePartitionClick = () => {
    partitionRef.current?.click();
  };

  const handlePartition = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      setWorking(true);
      setMessage(null);
      // For simplicity, assume the file name includes the table name like articles-2025-xx.ndjson.gz
      const table = file.name.split('-')[0];
      await loadPartitionFile(table, file, (count) =>
        setMessage(`Loaded ${count} records`),
      );
      setMessage('Partition load completed.');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Partition load failed', err);
      setMessage('Partition load failed');
    } finally {
      setWorking(false);
    }
  };

  const handleManifestUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const file = files[0];
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed && parsed.entries) {
        setManifestEntries(parsed.entries);
        setMessage('Manifest loaded');
      } else {
        setMessage('Invalid manifest');
      }
    } catch (err) {
      console.error('Manifest load failed', err);
      setMessage('Manifest load failed');
    }
  };

  const handleLoadSelectedClick = () => {
    // trigger file input for the user to select the chunk files to load
    loadMultipleRef.current?.click();
  };

  const handleLoadMultiple = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setWorking(true);
      setMessage(null);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const table = file.name.split('-')[0];
        // eslint-disable-next-line no-await-in-loop
        await loadPartitionFile(table, file, (count) =>
          setProgress(`Loaded ${count} records from ${file.name}`),
        );
      }
      setMessage('Selected partitions loaded');
    } catch (err) {
      console.error('Load multiple failed', err);
      setMessage('Load multiple failed');
    } finally {
      setWorking(false);
      setProgress(null);
    }
  };

  const handleCompactClick = () => {
    compactRef.current?.click();
  };

  const handleCompactFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setWorking(true);
      setMessage(null);
      setProgress('Merging files...');
      let mergedLines: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        // support gz or plain; if gz and DecompressionStream available, use stream, else use pako
        if (
          typeof window !== 'undefined' &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).DecompressionStream &&
          f.type === 'application/gzip'
        ) {
          const ds = f
            .stream()
            .pipeThrough(new DecompressionStream('gzip'))
            .pipeThrough(new TextDecoderStream());
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const reader = (ds as any).getReader();
          let acc = '';
          // eslint-disable-next-line no-await-in-loop
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            acc += value;
            let idx;
            // eslint-disable-next-line no-cond-assign
            while ((idx = acc.indexOf('\n')) >= 0) {
              const line = acc.slice(0, idx).trim();
              acc = acc.slice(idx + 1);
              if (line) mergedLines.push(line);
            }
          }
          if (acc.trim()) mergedLines.push(acc.trim());
        } else {
          const ab = await f.arrayBuffer();
          // handle gz by pako if needed
          if (f.type === 'application/gzip') {
            // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
            const pako = (await import('pako')).default;
            const s = pako.ungzip(new Uint8Array(ab), { to: 'string' });
            mergedLines = mergedLines.concat(s.split(/\r?\n/).filter(Boolean));
          } else {
            const s = new TextDecoder().decode(ab);
            mergedLines = mergedLines.concat(s.split(/\r?\n/).filter(Boolean));
          }
        }
      }
      setProgress('Writing compacted file...');
      const blob = new Blob([mergedLines.join('\n') + '\n'], {
        type: 'application/x-ndjson',
      });
      const name = `compacted-${new Date().toISOString().slice(0, 10)}.ndjson`;
      await saveBlobToFile(blob, name);
      setMessage('Compaction saved');
    } catch (err) {
      console.error('Compaction failed', err);
      setMessage('Compaction failed');
    } finally {
      setWorking(false);
      setProgress(null);
    }
  };

  return (
    <div className="db-backup">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <DbBackupStatus />
        {showPersistenceBanner && (
          <div className="alert alert-warning" role="alert">
            Persistent storage is disabled for this app. Data may be evicted by
            the browser. Please pick a backup folder or export your DB
            regularly.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          onClick={handlePartitionClick}
          disabled={working}
          className="btn btn-outline-secondary me-2"
        >
          Load Partition File
        </button>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={handlePickBackupFolder}
            disabled={working}
            className="btn btn-outline-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
            }}
          >
            <svg
              width="18"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 4H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"
                fill="#0d6efd"
              />
            </svg>
            <span style={{ minWidth: 160, textAlign: 'left' }}>
              {hasBackupDir ? backupDirLabel : 'Select backup folder'}
            </span>
          </button>
          {typeof window !== 'undefined' &&
            !('showDirectoryPicker' in window) && (
              <small className="text-muted">
                Directory picker not supported
              </small>
            )}
          {hasBackupDir && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              style={{ marginLeft: 6 }}
              onClick={async () => {
                try {
                  const { removeStoredDirectoryHandle } = await import(
                    '../utils/fs-utils'
                  );
                  await removeStoredDirectoryHandle('backup-folder');
                  setHasBackupDir(false);
                  setBackupDirLabel(null);
                  setMessage('Cleared backup folder');
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.error('Failed to clear folder handle', err);
                  setMessage('Failed to clear folder handle');
                }
              }}
            >
              Clear
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />

        <input
          ref={partitionRef}
          type="file"
          accept=".ndjson,.ndjson.gz,application/gzip"
          style={{ display: 'none' }}
          onChange={handlePartition}
        />
        <input
          ref={manifestRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={handleManifestUpload}
        />
        <input
          ref={loadMultipleRef}
          type="file"
          accept=".ndjson,.ndjson.gz,application/gzip"
          style={{ display: 'none' }}
          multiple
          onChange={handleLoadMultiple}
        />
        <input
          ref={compactRef}
          type="file"
          accept=".ndjson,.ndjson.gz,application/gzip"
          style={{ display: 'none' }}
          multiple
          onChange={handleCompactFiles}
        />
        <div className="mt-3">
          <details>
            <summary className="mb-2" style={{ cursor: 'pointer' }}>
              Advanced export & import options
            </summary>
            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginTop: 8,
              }}
            >
              <button
                type="button"
                onClick={handleExport}
                disabled={working}
                className="btn btn-primary"
              >
                {working ? 'Working...' : 'Export DB'}
              </button>

              <button
                type="button"
                onClick={handleImportClick}
                disabled={working}
                className="btn btn-outline-secondary"
              >
                Import DB
              </button>

              <button
                type="button"
                onClick={handlePartitionedExport}
                disabled={working}
                className="btn btn-primary"
              >
                Export Partitions
              </button>

              <button
                type="button"
                onClick={() => manifestRef.current?.click()}
                className="btn btn-outline-secondary me-2"
              >
                Load Manifest (advanced)
              </button>

              <button
                type="button"
                onClick={handleLoadSelectedClick}
                className="btn btn-outline-secondary me-2"
              >
                Load Selected Partitions
              </button>

              <button
                type="button"
                onClick={handleCompactClick}
                className="btn btn-outline-secondary"
              >
                Compact Selected Partitions
              </button>
            </div>
            <small className="text-muted d-block mt-2">
              The manifest is a machine-readable index of exported partition
              files (used for bulk imports). Most users won&rsquo;t need to
              interact with it directly.
            </small>
          </details>
        </div>
      </div>
      {progress && <div className="mt-2">{progress}</div>}
      {manifestEntries.length > 0 && (
        <div className="mt-3">
          <h6>Manifest Partitions</h6>
          <table className="table table-sm">
            <thead>
              <tr>
                <th></th>
                <th>Table</th>
                <th>File</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {manifestEntries.map((m) => (
                <tr key={m.fileName}>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selectedPartitions[m.fileName]}
                      onChange={() =>
                        setSelectedPartitions({
                          ...selectedPartitions,
                          [m.fileName]: !selectedPartitions[m.fileName],
                        })
                      }
                    />
                  </td>
                  <td>{m.table}</td>
                  <td>{m.fileName}</td>
                  <td>{m.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {message && <div className="mt-2">{message}</div>}
      {showStorageModal && (
        <div
          className="boot-pwa-modal"
          style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
            }}
          />
          <div
            style={{
              position: 'relative',
              margin: '10% auto',
              maxWidth: 600,
              background: '#fff',
              color: '#111',
              padding: 20,
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            <h5>Storage capacity warning</h5>
            <p>
              Your browser storage is almost full. Please backup your data to
              avoid loss.
            </p>
            <div
              style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowStorageModal(false)}
              >
                Dismiss
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowStorageModal(false);
                  handlePickBackupFolder();
                }}
              >
                Pick Backup Folder
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => {
                  setShowStorageModal(false);
                  handlePartitionedExport();
                }}
              >
                Backup Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
