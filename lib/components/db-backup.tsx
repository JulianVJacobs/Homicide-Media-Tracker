'use client';
import React, { useRef, useState } from 'react';
import {
  exportDbToBlob,
  importDbFromFile,
  saveBlobToFile,
  exportDbToCSVBlobs,
} from '../utils/db-io';
import DbBackupStatus from './db-backup-status';

type DbBackupProps = {
  compact?: boolean;
};

export default function DbBackup({ compact = false }: DbBackupProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [format, setFormat] = useState<'json' | 'csv'>('json');

  const handleExport = async () => {
    try {
      setWorking(true);
      setMessage(null);
      if (format === 'json') {
        const blob = await exportDbToBlob();
        await saveBlobToFile(blob, 'homicide-db.json');
      } else {
        const files = await exportDbToCSVBlobs();
        for (const f of files) {
          // save each CSV file (saveBlobToFile will write into stored dir if available)
          // eslint-disable-next-line no-await-in-loop
          await saveBlobToFile(f.blob, f.fileName);
        }
      }
      setMessage('Export completed');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Export failed', err);
      setMessage('Export failed');
    } finally {
      setWorking(false);
    }
  };

  // Note: Partitioned export and directory-pick UI removed in simplified flow.

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

  // simplified: no persistence banner or storage modal in compact UI

  // simplified component: no background persistence listeners here
  return (
    <div className="db-backup">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <DbBackupStatus />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {!compact && (
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
              className="form-select form-select-sm"
              style={{ width: 140 }}
            >
              <option value="json">JSON (full)</option>
              <option value="csv">CSV (per-table)</option>
            </select>
          )}
          <button
            type="button"
            onClick={handleExport}
            disabled={working}
            className={compact ? 'btn btn-sm btn-primary' : 'btn btn-primary'}
          >
            {working ? 'Working...' : 'Export'}
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            disabled={working}
            className={
              compact
                ? 'btn btn-sm btn-outline-secondary'
                : 'btn btn-outline-secondary'
            }
          >
            Import
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />

      {message && <div className="mt-2">{message}</div>}
    </div>
  );
}
