/* eslint-disable @typescript-eslint/no-explicit-any */
// Helpers to persist directory handles and write files using the File System Access API
// Store directory handles in the existing Dexie `appConfig` table so we reuse the
// same IDB database (NewsReportTrackerDB) instead of creating a separate
// "file-handles" database.

import { dbm } from '../db/client';

export async function storeDirectoryHandle(
  key: string,
  handle: FileSystemDirectoryHandle,
) {
  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();

  // Store the handle under the given key in appConfig. Use valueType to mark
  // that this entry holds a handle so other consumers can ignore it if needed.
  const existing = await (db as any).appConfig.where({ key }).first();
  if (existing) {
    await (db as any).appConfig.update(existing.id, {
      value: handle,
      valueType: 'handle',
      updatedAt: new Date().toISOString(),
    });
  } else {
    await (db as any).appConfig.put({
      key,
      value: handle,
      valueType: 'handle',
      description: null,
      updatedAt: new Date().toISOString(),
    } as any);
  }
}

export async function getStoredDirectoryHandle(key: string) {
  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();
  const entry = await (db as any).appConfig.where({ key }).first();
  return (entry ? (entry.value as FileSystemDirectoryHandle) : null) ?? null;
}

export async function removeStoredDirectoryHandle(key: string) {
  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();
  const entry = await (db as any).appConfig.where({ key }).first();
  if (entry) {
    await (db as any).appConfig.delete(entry.id);
  }
}

export async function saveBlobToDirectory(
  dirHandle: FileSystemDirectoryHandle,
  filename: string,
  blob: Blob,
  gzip = true,
) {
  if (gzip && typeof window !== 'undefined' && 'CompressionStream' in window) {
    const fileHandle = await dirHandle.getFileHandle(
      filename.endsWith('.gz') ? filename : `${filename}.gz`,
      { create: true },
    );
    const writable = await fileHandle.createWritable();
    // stream + gzip
    const reader = blob.stream();
    // CompressionStream may be untyped in this environment; cast to any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (reader as any)
      .pipeThrough(new CompressionStream('gzip') as any)
      .pipeTo(writable);
    return;
  }

  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}
