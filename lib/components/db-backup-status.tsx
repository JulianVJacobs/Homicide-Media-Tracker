'use client';
import React, { useEffect, useState } from 'react';

export default function DbBackupStatus() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const onBackupSelected = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.name) setLabel(detail.name);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener(
        'backup-folder-selected',
        onBackupSelected as EventListener,
      );
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(
          'backup-folder-selected',
          onBackupSelected as EventListener,
        );
      }
    };
  }, []);

  if (!label) return null;
  return (
    <div className="text-sm text-muted-foreground">
      Backup folder: <strong className="ml-1">{label}</strong>
    </div>
  );
}
