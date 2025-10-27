/* eslint-disable @typescript-eslint/no-explicit-any */
import type Dexie from 'dexie';
import { dbm } from '../db/client';
import {
  getStoredDirectoryHandle,
  saveBlobToDirectory,
  storeDirectoryHandle,
} from './fs-utils';

export async function exportDbToBlob(): Promise<Blob> {
  await dbm.ensureDatabaseInitialised();
  const db: Dexie = dbm.getLocal() as unknown as Dexie;
  const data: Record<string, unknown[]> = {};
  for (const table of db.tables) {
    // Dexie Table has a .name - extract as string
    const tableName = (table as any).name as string;
    data[tableName] = await (table as any).toArray();
  }
  const payload = JSON.stringify({ version: 1, data }, null, 2);
  return new Blob([payload], { type: 'application/json' });
}

export async function importDbFromFile(file: File): Promise<void> {
  const text = await file.text();
  const payload = JSON.parse(text);
  if (!payload?.data) throw new Error('Invalid DB export');
  await dbm.ensureDatabaseInitialised();
  const db: Dexie = dbm.getLocal() as unknown as Dexie;

  // Clear and bulk restore within a transaction
  const tableNames = db.tables.map((t: any) => t.name as string);
  // call Dexie.transaction with dynamic table names via apply
  // arguments: 'rw', ...tableNames, async function
  await (db as any).transaction.apply(db, [
    'rw',
    ...tableNames,
    async () => {
      for (const table of db.tables) {
        await (table as any).clear();
      }
      for (const [tableName, rows] of Object.entries(payload.data)) {
        const table = (db as any)[tableName];
        if (table && Array.isArray(rows) && rows.length) {
          await table.bulkPut(rows);
        }
      }
    },
  ]);
}

export async function saveBlobToFile(
  blob: Blob,
  suggestedName = 'homicide-db.json',
) {
  // First, if the user previously selected and stored a backup directory,
  // write directly into that directory (no prompt).
  try {
    if (typeof window !== 'undefined') {
      const stored = await getStoredDirectoryHandle('backup-folder');
      if (stored) {
        try {
          await saveBlobToDirectory(stored, suggestedName, blob, true);
          return true;
        } catch (err) {
          // fallback to save dialog if writing into stored dir fails
          // eslint-disable-next-line no-console
          console.error('Failed to write to stored backup folder', err);
        }
      }
    }

    if (typeof window !== 'undefined' && (window as any).showSaveFilePicker) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: 'JSON',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();

      // Best-effort: offer to save the containing directory as the backup folder.
      // We cannot always obtain the parent directory handle from a FileSystemFileHandle,
      // so ask the user to confirm and then prompt them to pick the directory (pre-filled
      // with the file handle if the browser supports it).
      try {
        // eslint-disable-next-line no-alert
        const saveAsBackup =
          typeof window !== 'undefined' &&
          window.confirm &&
          window.confirm('Set this folder as the default backup folder?');
        if (saveAsBackup) {
          const w = window as unknown as Window & {
            showDirectoryPicker?: (
              opts?: any,
            ) => Promise<FileSystemDirectoryHandle>;
          };
          if (w.showDirectoryPicker) {
            try {
              // Some browsers accept a file handle for startIn — this is best-effort.
              const dirHandle = await w.showDirectoryPicker({
                startIn: handle,
              });
              await storeDirectoryHandle('backup-folder', dirHandle);
            } catch (err) {
              // If the prefilled directory pick failed, fall back to opening a picker
              try {
                const dirHandle = await (w.showDirectoryPicker as any)();
                await storeDirectoryHandle('backup-folder', dirHandle);
              } catch (err2) {
                // ignore if user cancels or browser doesn't support
                // eslint-disable-next-line no-console
                console.error('Failed to store backup folder after save', err2);
              }
            }
          }
        }
      } catch (err) {
        // ignore confirmation errors
      }

      return true;
    }
  } catch (err) {
    // fall back to download method below
    // eslint-disable-next-line no-console
    console.error('saveBlobToFile: fallback path due to', err);
  }
  // Fallback: download
  if (typeof document === 'undefined') return true;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return true;
}

export type PartitionManifestEntry = {
  table: string;
  fileName: string;
  count: number;
  minDate?: string;
  maxDate?: string;
};

export async function exportPartitionedNDJSON(options?: {
  maxRecordsPerChunk?: number;
}) {
  const max = options?.maxRecordsPerChunk ?? 10000;
  await dbm.ensureDatabaseInitialised();
  const db: Dexie = dbm.getLocal() as unknown as Dexie;

  const manifest: PartitionManifestEntry[] = [];
  const indexEntries: Record<string, any[]> = {};

  for (const table of db.tables) {
    const tableName = (table as any).name as string;
    const all = await (table as any).toArray();
    if (!all || all.length === 0) continue;
    indexEntries[tableName] = [];
    let chunk = 0;
    for (let i = 0; i < all.length; i += max) {
      const slice = all.slice(i, i + max);
      const lines = slice.map((r: any) => JSON.stringify(r)).join('\n') + '\n';
      const blob = new Blob([lines], { type: 'application/x-ndjson' });
      const fileName = `${tableName}-${new Date().toISOString().slice(0, 10)}-${String(chunk).padStart(4, '0')}.ndjson`;
      manifest.push({ table: tableName, fileName, count: slice.length });
      // Prepare index: keep small summary fields for graphing
      for (const r of slice) {
        indexEntries[tableName].push({
          id: r.id,
          title:
            r.newsReportHeadline || r.victimName || r.perpetratorName || '',
          date: r.dateOfPublication || r.dateOfDeath || null,
          partition: fileName,
        });
      }
      // Attach blob to manifest entry by writing a placeholder; caller will call saveBlobToFile with actual blob
      (manifest[manifest.length - 1] as any).blob = blob;
      chunk++;
    }
  }

  const indexBlobs: { table: string; blob: Blob }[] = [];
  for (const [table, arr] of Object.entries(indexEntries)) {
    const lines = arr.map((r) => JSON.stringify(r)).join('\n') + '\n';
    indexBlobs.push({
      table,
      blob: new Blob([lines], { type: 'application/x-ndjson' }),
    });
  }

  // Create manifest blob
  const manifestBlob = new Blob(
    [
      JSON.stringify(
        { createdAt: new Date().toISOString(), entries: manifest },
        null,
        2,
      ),
    ],
    { type: 'application/json' },
  );

  return { manifest, manifestBlob, indexBlobs };
}

// Eviction marker helpers: write a small key into appConfig so we can verify
export async function writeEvictionMarker() {
  await dbm.ensureDatabaseInitialised();
  // Dexie DB instance
  const db: any = dbm.getLocal();
  try {
    // appConfig table exists per schema
    await (db as any).appConfig.put({
      key: 'eviction_marker',
      value: String(Date.now()),
      valueType: 'string',
    });
    return true;
  } catch (err) {
    // ignore errors
    return false;
  }
}

export async function verifyEvictionMarker(): Promise<boolean> {
  await dbm.ensureDatabaseInitialised();
  const db: any = dbm.getLocal();
  try {
    const row = await (db as any).appConfig.get({ key: 'eviction_marker' });
    return !!row;
  } catch (err) {
    return false;
  }
}

export async function hasAnyData(): Promise<boolean> {
  await dbm.ensureDatabaseInitialised();
  const db: any = dbm.getLocal();
  try {
    for (const t of db.tables) {
      const name = (t as any).name as string;
      // skip appConfig
      if (name === 'appConfig' || name === 'app_config') continue;
      const count = await (t as any).count();
      if (count && count > 0) return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}
