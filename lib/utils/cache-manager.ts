/* eslint-disable @typescript-eslint/no-explicit-any */
import { dbm } from '../db/client';

/**
 * Simple partition cache manager.
 * - Index metadata is stored in Dexie (appConfig table) under key 'partitions'
 * - Cached records are inserted into Dexie tables when loaded
 */

type PartitionEntry = {
  table: string;
  fileName: string;
  count: number;
  minDate?: string;
  maxDate?: string;
};

const PARTITIONS_KEY = 'partitions_manifest_v1';

export async function getPartitions(): Promise<PartitionEntry[]> {
  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();
  const entry = await db.appConfig.where({ key: PARTITIONS_KEY }).first();
  if (!entry || !entry.value) return [];
  try {
    return JSON.parse(entry.value as string) as PartitionEntry[];
  } catch (err) {
    return [];
  }
}

export async function savePartitions(parts: PartitionEntry[]) {
  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();
  const payload = JSON.stringify(parts);
  const existing = await db.appConfig.where({ key: PARTITIONS_KEY }).first();
  if (existing) {
    await db.appConfig.update(existing.id, { value: payload });
  } else {
    await db.appConfig.put({
      key: PARTITIONS_KEY,
      value: payload,
      valueType: 'string',
      description: null,
      updatedAt: null,
    } as any);
  }
}

// Stream a gzipped NDJSON file and insert into table
export async function loadPartitionFile(
  tableName: string,
  file: File,
  onProgress?: (n: number) => void,
) {
  await dbm.ensureDatabaseInitialised();
  const db = dbm.getLocal();
  // read stream and parse lines
  let lines = 0;
  const stream = file.stream();
  // Guard access to DecompressionStream for SSR
  const ds =
    typeof window !== 'undefined' && 'DecompressionStream' in window
      ? stream.pipeThrough(new DecompressionStream('gzip'))
      : stream;
  const textStream = (ds as any).pipeThrough
    ? (ds as any).pipeThrough(new TextDecoderStream())
    : null;
  if (textStream) {
    const reader = (textStream as any).getReader();
    let buffer = '';
    const batch: any[] = [];
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      let idx;
      // eslint-disable-next-line no-cond-assign
      while ((idx = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (line) {
          try {
            const obj = JSON.parse(line);
            batch.push(obj);
            lines++;
            if (batch.length >= 200) {
              // eslint-disable-next-line no-await-in-loop
              await (db as any)[tableName].bulkPut(batch);
              batch.length = 0;
              if (onProgress) onProgress(lines);
            }
          } catch (e) {
            // ignore parse error
          }
        }
      }
    }
    if (buffer.trim()) {
      try {
        const obj = JSON.parse(buffer.trim());
        batch.push(obj);
        lines++;
      } catch (e) {
        // ignore
      }
    }
    if (batch.length) await (db as any)[tableName].bulkPut(batch);
    if (onProgress) onProgress(lines);
  } else {
    // Fallback: read whole file for browsers without DecompressionStream
    const ab = await file.arrayBuffer();
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const pako = (await import('pako')).default;
    const decompressed = pako.ungzip(new Uint8Array(ab), { to: 'string' });
    const linesArr = decompressed.split(/\r?\n/).filter(Boolean);
    for (let i = 0; i < linesArr.length; i += 200) {
      const chunk = linesArr
        .slice(i, i + 200)
        .map((l: string) => JSON.parse(l));
      // eslint-disable-next-line no-await-in-loop
      await (db as any)[tableName].bulkPut(chunk);
      if (onProgress) onProgress(Math.min(linesArr.length, i + 200));
    }
  }
}
